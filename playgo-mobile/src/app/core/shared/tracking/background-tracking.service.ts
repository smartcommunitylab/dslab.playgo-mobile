import { Inject, Injectable, NgZone } from '@angular/core';
import { AlertService } from 'src/app/core/shared/services/alert.service';

import {
  AuthorizationStatus,
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
  firstValueFrom,
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
  ACCESS_DENIED,
  TransportType,
  TripPart,
  UNABLE_TO_GET_POSITION,
} from './trip.model';
import { runInZone } from '../rxjs.utils';
import { PlayerControllerService } from '../../api/generated/controllers/playerController.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/auth.service';
import { AppStatusService } from '../services/app-status.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../services/local-storage.service';

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
    this.isReady.then(() => this.backgroundGeolocationPlugin.isPowerSaveMode()),
    this.getPluginObservable(this.backgroundGeolocationPlugin.onPowerSaveChange)
  ).pipe(
    startWith(false),
    distinctUntilChanged(),
    tap(NgZone.assertInAngularZone),
    shareReplay(1)
  );

  private appAndDeviceInfo$: Observable<DeviceInfo> = combineLatest([
    this.appStatusService.appInfo$,
    this.appStatusService.deviceInfo$,
    this.appStatusService.codePushLabel$.pipe(startWith('unknown')),
  ]).pipe(
    map(([appInfo, deviceInfo, codePushLabel]) => ({
      isVirtual: deviceInfo.isVirtual,
      platform: deviceInfo.platform,
      version: appInfo.version,
      codePushLabel,
      osVersion: deviceInfo.osVersion,
      model: deviceInfo.model,
    })),
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
    private appStatusService: AppStatusService,
    private zone: NgZone,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService
  ) {
    // FIXME: debug only
    (window as any).backgroundGeolocationPlugin =
      this.backgroundGeolocationPlugin;

    // start observing plugin events
    this.pluginLocation$.subscribe();
    this.isPowerSaveMode$.subscribe();
  }

  async askForPermissions(): Promise<
    'ACCEPTED' | 'DENIED' | 'DENIED_SILENTLY' | 'ACCEPTED_WHEN_IN_USE'
  > {
    await this.isReady;
    // Manually request permission with configured locationAuthorizationRequest.
    let status: AuthorizationStatus;
    const now = performance.now();
    try {
      // AUTHORIZATION_STATUS_NOT_DETERMINED | iOS only
      // AUTHORIZATION_STATUS_RESTRICTED     | iOS only
      // AUTHORIZATION_STATUS_DENIED         | iOS & Android
      // AUTHORIZATION_STATUS_ALWAYS         | iOS & Android
      // AUTHORIZATION_STATUS_WHEN_IN_USE    | iOS only

      status = await this.backgroundGeolocationPlugin.requestPermission();
      console.log('status requestPermission: ' + status);
    } catch (errorStatus) {
      status = errorStatus as AuthorizationStatus;
    }
    const executionTime = performance.now() - now;
    console.log('executionTime: ' + executionTime);

    if (
      status === this.backgroundGeolocationPlugin.AUTHORIZATION_STATUS_ALWAYS
    ) {
      return 'ACCEPTED';
    }
    if (
      status ===
      this.backgroundGeolocationPlugin.AUTHORIZATION_STATUS_WHEN_IN_USE
    ) {
      return 'ACCEPTED_WHEN_IN_USE';
    }
    // real time is around 400ms
    if (executionTime < 1000) {
      return 'DENIED_SILENTLY';
    }
    return 'DENIED';
  }
  async start() {
    try {
      const titlePermission = await firstValueFrom(
        this.translateService.get('permission.title')
      );
      const messagePermission = await firstValueFrom(
        this.translateService.get('permission.message')
      );
      const positiveActionPermission = await firstValueFrom(
        this.translateService.get('permission.positiveAction')
      );
      const cancelActionPermission = await firstValueFrom(
        this.translateService.get('permission.cancelAction')
      );
      const appAndDeviceInfo = await firstValueFrom(this.appAndDeviceInfo$);
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
        disableLocationAuthorizationAlert: true,
        notification: {
          smallIcon: 'drawable/ic_push',
        },
        backgroundPermissionRationale: {
          title: titlePermission,
          message: messagePermission,
          positiveAction: positiveActionPermission,
          negativeAction: cancelActionPermission,
        },
        params: {
          device: appAndDeviceInfo,
        },
      };
      // console.log('starting BackgroundGeolocation', config);
      const state = await this.backgroundGeolocationPlugin.ready(config);

      console.log('BackgroundGeolocation ready', state, config);
    } catch (e) {
      console.error('BackgroundGeolocation', e);
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

  public async clearPluginData() {
    await this.isReady;
    await this.backgroundGeolocationPlugin.setConfig({});
    this.currentExtrasSubject.next({});
    await this.backgroundGeolocationPlugin.stop();
    this.backgroundGeolocationPlugin.destroyLocations();
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
        await this.trySync();
      } catch (maybe401Error) {
        console.log('Sync failed, trying to get new token');

        // maybe sync failed because the token is expired. Let's try to call some
        // api to refresh the token and try again.
        await this.playerControllerService.getProfileUsingGET().toPromise();
        await this.trySync();
      }
    } catch (e) {
      console.warn('Sync failed, we will try to sync next time', e);
    }
    this.possibleLocationsChangeSubject.next();
  }

  private async trySync(): Promise<void> {
    const token = await this.authService.getToken();
    // console.log('sync using token', token);
    await this.backgroundGeolocationPlugin.setConfig({
      authorization: {
        strategy: 'jwt',
        accessToken: token.accessToken,
      },
    });

    const locationSentToServer: Location[] =
      (await this.backgroundGeolocationPlugin.getLocations()) as Location[];

    // .sync call will fail, if the network is not available
    // I dont know why is seems that it is not possible to get list of locations
    // that was really sent...
    await this.backgroundGeolocationPlugin.sync();

    this.synchronizedLocationsSubject.next(
      locationSentToServer.map(TripLocation.fromLocation)
    );
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
  idTrip: string;
  latitude: number;
  longitude: number;
  date: number;
  constructor(data?: Partial<TripLocation>) {
    Object.assign(this, data || {});
  }
  static fromLocation(location: Location): TripLocation {
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

interface DeviceInfo {
  isVirtual: boolean;
  platform: string;
  version: string;
  codePushLabel: string;
  osVersion: string;
  model: string;
}
