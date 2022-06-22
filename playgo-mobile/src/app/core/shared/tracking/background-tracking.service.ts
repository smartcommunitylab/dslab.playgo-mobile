import { Inject, Injectable, NgZone } from '@angular/core';
import { AlertService } from 'src/app/core/shared/services/alert.service';

import {
  Config,
  Extras,
  Location,
  Subscription,
} from '@transistorsoft/capacitor-background-geolocation';

// No not use BackgroundGeolocation / BackgroundGeolocationInternal directly, but use dependency injection!
import { default as BackgroundGeolocationInternal } from '@transistorsoft/capacitor-background-geolocation';
import { filter as _filter, fromPairs, isEqual, last, pick } from 'lodash-es';
import {
  combineLatest,
  concat,
  lastValueFrom,
  merge,
  Observable,
  ReplaySubject,
  Subject,
  timer,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  first,
  map,
  take,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  LOW_ACCURACY,
  POWER_SAVE_MODE,
  TransportType,
  TripPart,
  UNABLE_TO_GET_POSITION,
} from './trip.model';
import { runInZone, tapLog } from '../utils';
import { AuthService } from 'ionic-appauth';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { TokenResponse } from '@openid/appauth';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private token$: Observable<TokenResponse> = this.authService.token$.pipe(
    filter((token) => token !== null),
    shareReplay(1)
  );

  private markAsReady: (val: unknown) => void;
  private isReady = new Promise((resolve, reject) => {
    this.markAsReady = resolve;
  });
  private appConfig = { tracking: { maximalAccuracy: 30 } };

  private pluginLocation$ = this.getPluginObservable(
    this.backgroundGeolocationPlugin.onLocation
  ).pipe(tap(NgZone.assertInAngularZone), shareReplay(1));

  public accuracy$ = this.pluginLocation$.pipe(
    map((loc) => loc.coords.accuracy),
    shareReplay(1)
  );
  public lowAccuracy$ = this.accuracy$.pipe(
    map((accuracy) => accuracy > this.appConfig.tracking.maximalAccuracy),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public currentLocation$: Observable<TripLocation> = this.pluginLocation$.pipe(
    map(TripLocation.fromLocation),
    shareReplay(1)
  );

  public isPowerSaveMode$: Observable<boolean> = concat(
    this.isReady.then(this.backgroundGeolocationPlugin.isPowerSaveMode),
    this.getPluginObservable(this.backgroundGeolocationPlugin.onPowerSaveChange)
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tap(NgZone.assertInAngularZone),
    shareReplay(1)
  );

  private possibleLocationsChangeSubject = new ReplaySubject<void>();
  private currentExtrasSubject = new ReplaySubject<TripExtras>();

  public notSynchronizedLocations$: Observable<TripLocation[]> = merge(
    this.currentLocation$,
    this.possibleLocationsChangeSubject.pipe(/*debounceTime(100)*/)
  ).pipe(
    startWith('initial getLocation request'),
    switchMap(
      () =>
        this.backgroundGeolocationPlugin.getLocations() as Promise<Location[]>
    ),
    map((rawLocations) => rawLocations.map(TripLocation.fromLocation)),
    distinctUntilChanged(isEqual),
    // tapLog('trip locations'),
    shareReplay(1)
  );

  public currentTripLocations$ = combineLatest([
    this.notSynchronizedLocations$,
    this.currentExtrasSubject, //FIXME: better!
  ]).pipe(
    map(([notSynchronizedLocations, currentExtras]) =>
      _filter(notSynchronizedLocations, {
        multimodalId: currentExtras.multimodalId,
      })
    ),
    shareReplay(1)
  );

  /**  watch all onLocation events, but also take last location from database */
  public lastLocation$: Observable<TripLocation> = concat(
    this.notSynchronizedLocations$.pipe(
      first(),
      map((x) => last(x)),
      takeUntil(this.currentLocation$)
    ),
    this.currentLocation$
  ).pipe(distinctUntilChanged(isEqual), shareReplay(1));

  private synchronizedLocationsSubject = new ReplaySubject<TripLocation[]>(1);
  public synchronizedLocations$ =
    this.synchronizedLocationsSubject.asObservable();

  /** manually get locations without starting the tracking */
  public coldForegroundLocation$: Observable<Location> = timer(0, 10000).pipe(
    switchMap(() =>
      this.backgroundGeolocationPlugin.getCurrentPosition({
        timeout: 1000,
        persist: false,
      })
    )
  );

  constructor(
    @Inject('BackgroundGeolocationPlugin')
    private backgroundGeolocationPlugin: typeof BackgroundGeolocationInternal,
    private alertService: AlertService,
    private authService: AuthService,
    private playerControllerService: PlayerControllerService,
    private zone: NgZone
  ) {
    // FIXME: debug only
    (window as any).backgroundGeolocationPlugin =
      this.backgroundGeolocationPlugin;

    // start observing plugin events
    this.pluginLocation$.subscribe();
    this.isPowerSaveMode$.subscribe();
  }

  async start() {
    try {
      const config: Config = {
        url:
          environment.serverUrl.api +
          environment.serverUrl.apiPath +
          '/track/player/geolocations',
        distanceFilter: 10,
        stopOnTerminate: false,
        startOnBoot: false,
        autoSync: false,
        batchSync: true,
        authorization: null,
      };
      console.log('starting BackgroundGeolocation', config);
      const state = await this.backgroundGeolocationPlugin.ready(config);

      console.log('BackgroundGeolocation ready', state);
    } catch (e) {
      console.error(e);
    }
    this.markAsReady(true);
  }

  public async syncInitialLocations() {
    await this.isReady;
    await this.sync();
    await this.backgroundGeolocationPlugin.stop();
    this.possibleLocationsChangeSubject.next();
  }

  public async startTracking(tripPart: TripPart, doChecks: boolean) {
    const location = await this.setExtrasAndForceLocation(tripPart);
    const accuracy = location.coords.accuracy;
    if (doChecks) {
      if (accuracy > this.appConfig.tracking.maximalAccuracy) {
        const userAcceptsLowAccuracy = await this.showLowAccuracyWarning();
        if (!userAcceptsLowAccuracy) {
          throw LOW_ACCURACY;
        }
      }
      const isPowerSaveMode =
        await this.backgroundGeolocationPlugin.isPowerSaveMode();
      if (isPowerSaveMode) {
        throw POWER_SAVE_MODE;
      }
    }

    await this.backgroundGeolocationPlugin.start();
    this.possibleLocationsChangeSubject.next();
  }

  private async showLowAccuracyWarning() {
    return await this.alertService.confirmAlert(
      'modal.alert_title',
      'tracking.continue_low_accuracy_prompt'
    );
  }

  public async stopTracking() {
    await this.setExtrasAndForceLocation(null);
    await this.backgroundGeolocationPlugin.stop();
    await this.sync();
    this.possibleLocationsChangeSubject.next();
  }
  private async sync() {
    try {
      try {
        this.trySync();
      } catch (maybe401Error) {
        console.log('Sync failed, trying to get new token');

        // maybe sync failed because the token is expired. Let's try to call some
        // api to refresh the token and try again.
        await this.playerControllerService.getProfileUsingGET().toPromise();
        this.trySync();
      }
    } catch (e) {
      console.warn('Sync failed, we will try to sync next time', e);
    }
    this.possibleLocationsChangeSubject.next();
  }

  private async trySync(): Promise<void> {
    const token = await this.getToken();
    console.log('sync using token', token);
    await this.backgroundGeolocationPlugin.setConfig({
      authorization: {
        strategy: 'jwt',
        accessToken: token.accessToken,
      },
    });

    const locationSentToServer =
      await this.backgroundGeolocationPlugin.getLocations();

    // .sync call will fail, if the network is not available
    // I dont know why is seems that it is not possible to get list of locations
    // that was really sent...
    await this.backgroundGeolocationPlugin.sync();

    this.synchronizedLocationsSubject.next(
      locationSentToServer.map(TripLocation.fromLocation)
    );
    this.possibleLocationsChangeSubject.next();
  }

  /** Waits for the first token available, but later it will return latest token immediately */
  private async getToken(): Promise<TokenResponse> {
    return await lastValueFrom(this.token$.pipe(take(1)));
  }

  private async setExtrasAndForceLocation(
    tripPart: TripPart | null
  ): Promise<Location> {
    await this.isReady;
    const extras = this.getExtras(tripPart);

    await this.backgroundGeolocationPlugin.setConfig({ extras });
    this.currentExtrasSubject.next(extras);
    let currentLocation: Location;

    try {
      currentLocation =
        await this.backgroundGeolocationPlugin.getCurrentPosition({
          // TODO: this does not work...
          extras: { ...extras, forced: true },
        });
    } catch (e) {
      console.error(e);
      throw UNABLE_TO_GET_POSITION;
    }

    this.possibleLocationsChangeSubject.next();
    return currentLocation;
  }

  private getExtras(tripPart: TripPart | null): TripExtras {
    return {
      idTrip: tripPart?.idTrip,
      multimodalId: tripPart?.multimodalId,
      start: tripPart?.start,
      transportType: tripPart?.transportType,
      sharedTravelId: tripPart?.sharedTravelId,
    };
  }

  private getPluginObservable<T>(
    createPluginSubscriptionFn: (callback: (event: T) => void) => Subscription
  ): Observable<T> {
    const subject = new ReplaySubject<T>();
    const pluginSubscription = createPluginSubscriptionFn((event) => {
      subject.next(event);
    });

    return subject.pipe(
      runInZone(this.zone),
      finalize(() => {
        pluginSubscription.remove();
      })
    );
  }
}

export class TripLocation {
  transportType: TransportType;
  multimodalId: string;
  idTrip: string;
  latitude: number;
  longitude: number;
  date: number;
  constructor(data?: Partial<TripLocation>) {
    Object.assign(this, data || {});
  }
  static fromLocation(location: Location) {
    const extras = (location.extras || {}) as TripExtras;
    return new TripLocation({
      date: new Date(location.timestamp).getTime(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      multimodalId: extras.multimodalId,
      idTrip: extras.idTrip,
      transportType: extras.transportType,
    });
  }
}

interface TripExtras extends Extras, Partial<TripPart> {}
