import { Inject, Injectable, NgZone } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/core/shared/services/alert.services';

import BackgroundGeolocation, {
  Config,
  Extras,
  Location,
  Subscription,
} from '@transistorsoft/capacitor-background-geolocation';
import { filter as _filter, isEqual, pick } from 'lodash-es';
import { combineLatest, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { LOW_ACCURACY, TransportType, TripPart } from './trip.model';
import { runInZone, tapLog } from './utils';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private markAsReady: (val: unknown) => void;
  private isReady = new Promise((resolve, reject) => {
    this.markAsReady = resolve;
  });
  private appConfig = { tracking: { minimalAccuracy: 10 } };

  public currentLocation$: Observable<TripLocation> = this.getPluginObservable(
    this.backgroundGeolocationPlugin.onLocation
  ).pipe(
    tap(NgZone.assertInAngularZone),
    map(TripLocation.fromLocation),
    shareReplay(1)
  );

  private possibleLocationsChangeSubject = new Subject<void>();
  private currentExtrasSubject = new Subject<TripExtras>();

  public notSynchronizedLocations$: Observable<TripLocation[]> = merge(
    this.currentLocation$,
    this.possibleLocationsChangeSubject.pipe(/*debounceTime(100)*/)
  ).pipe(
    switchMap(
      () =>
        this.backgroundGeolocationPlugin.getLocations() as Promise<Location[]>
    ),
    map((rawLocations) => rawLocations.map(TripLocation.fromLocation)),
    distinctUntilChanged(isEqual),
    shareReplay(1),
    tapLog('trip locations')
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

  constructor(
    @Inject(BackgroundGeolocation)
    private backgroundGeolocationPlugin: typeof BackgroundGeolocation,
    // public alertController: AlertController,
    private alertService: AlertService,
    private zone: NgZone
  ) {
    // FIXME: debug only
    (window as any).backgroundGeolocationPlugin =
      this.backgroundGeolocationPlugin;

    // start observing plugin events
    this.currentLocation$.subscribe();
  }

  async start() {
    try {
      // !!! location will be synced to the public open https://tracker.transistorsoft.com/fbk_dslab
      const debugTokenForPublicServer =
        await this.backgroundGeolocationPlugin.findOrCreateTransistorAuthorizationToken(
          'fbk_dslab',
          'mmikula'
        );

      const config: Config = {
        transistorAuthorizationToken: debugTokenForPublicServer,
        distanceFilter: 10,
        stopOnTerminate: false,
        startOnBoot: false,
        autoSync: false,
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

  public async startTracking(tripPart: TripPart) {
    console.log('start Tracking');

    const location = await this.setExtrasAndForceLocation(tripPart);
    const accuracy = location.coords.accuracy;
    if (accuracy < this.appConfig.tracking.minimalAccuracy) {
      console.log('low accuracy');
      const userAcceptsLowAccuracy = await this.showLowAccuracyWarning();
      if (!userAcceptsLowAccuracy) {
        throw LOW_ACCURACY;
      }
    }
    await this.backgroundGeolocationPlugin.start();
    this.possibleLocationsChangeSubject.next();
  }

  private async showLowAccuracyWarning() {
    return await this.confirmPopup({
      message: 'Low accuracy detected!.'
    });
  }

  // TODO: move to other service!
  private async confirmPopup({
    message,
  }: {
    message: string;
  }) {
    return this.alertService.confirmAlert('Alert', message);
  }

  public async stopTracking() {
    await this.setExtrasAndForceLocation(null);
    await this.backgroundGeolocationPlugin.stop();
    await this.sync();
    this.possibleLocationsChangeSubject.next();
  }
  private async sync() {
    try {
      await this.backgroundGeolocationPlugin.sync();
    } catch (e) {
      console.warn('Sync failed, we will try to sync next time', e);
    }
    this.possibleLocationsChangeSubject.next();
  }
  private async setExtrasAndForceLocation(tripPart: TripPart | null) {
    await this.isReady;
    const extras = this.getExtras(tripPart);

    await this.backgroundGeolocationPlugin.setConfig({ extras });
    this.currentExtrasSubject.next(extras);

    const currentLocation =
      await this.backgroundGeolocationPlugin.getCurrentPosition({
        // TODO: this does not work...
        extras: { ...extras, forced: true },
      });
    this.possibleLocationsChangeSubject.next();
    return currentLocation;
  }

  private getExtras(tripPart: TripPart | null): TripExtras {
    return {
      idTrip: tripPart?.idTrip,
      multimodalId: tripPart?.multimodalId,
      start: tripPart?.start,
      transportType: tripPart?.transportType,
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

interface TripExtras extends Extras, TripPart { }
