import { Inject, Injectable, NgZone } from '@angular/core';
import { AlertService } from 'src/app/core/shared/services/alert.services';

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
  merge,
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  finalize,
  first,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  LOW_ACCURACY,
  POWER_SAVE_MODE,
  TransportType,
  TripPart,
  UNABLE_TO_GET_POSITION,
} from './trip.model';
import { runInZone, tapLog } from '../utils';
import { AuthHttpService } from '../../auth/auth-http.service';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
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
    tapLog('trip locations'),
    shareReplay(1)
  );

  public currentTripLocations$: Observable<TripLocation[]> = combineLatest([
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

  constructor(
    @Inject(BackgroundGeolocationInternal)
    private backgroundGeolocationPlugin: typeof BackgroundGeolocationInternal,
    private alertService: AlertService,
    private authHttpService: AuthHttpService,
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
        url: this.authHttpService.getApiUrl('/track/player/geolocations'),
        distanceFilter: 10,
        stopOnTerminate: false,
        startOnBoot: false,
        autoSync: false,
        batchSync: true,
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
      const headers = await this.authHttpService.getHeaders();
      console.log('sync using headers', headers);
      await this.backgroundGeolocationPlugin.setConfig({ headers });
      await this.backgroundGeolocationPlugin.sync();
    } catch (e) {
      console.warn('Sync failed, we will try to sync next time', e);
    }
    this.possibleLocationsChangeSubject.next();
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
  latitude: number;
  longitude: number;
  constructor(data?: Partial<TripLocation>) {
    Object.assign(this, data || {});
  }
  static fromLocation(location: Location) {
    const extras = (location.extras || {}) as TripExtras;
    return new TripLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      multimodalId: extras.multimodalId,
      transportType: extras.transportType,
    });
  }
}

interface TripExtras extends Extras, Partial<TripPart> {}
