import { Injectable } from '@angular/core';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { TripService } from './trip.service';
import BackgroundGeolocation, {
  Config,
  Extras,
} from '@transistorsoft/capacitor-background-geolocation';
import { filter, map } from 'rxjs/operators';
import { Trip, TripPart, TRIP_END } from './trip.model';
import { TripPersistanceService } from './trip-persistance.service';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private isReady$ = new ReplaySubject<void>();

  private extras$: Observable<TripExtras> = this.tripService.tripPart$.pipe(
    map((tripPartOrEndTrip) => {
      // console.log('extras data:', tripPartOrEndTrip);
      if (tripPartOrEndTrip !== TRIP_END) {
        return {
          start: tripPartOrEndTrip.start,
          transportType: tripPartOrEndTrip.transportType,
          idTrip: tripPartOrEndTrip.idTrip,
          multimodalId: tripPartOrEndTrip.multimodalId,
        };
      }
      return {
        start: null,
        transportType: null,
        idTrip: null,
        multimodalId: null,
      };
    })
  );
  constructor(
    private tripService: TripService,
    private tripPersistanceService: TripPersistanceService
  ) {
    // FIXME: debug only
    (window as any).BackgroundGeolocation = BackgroundGeolocation;
  }

  async start() {
    try {
      // !!! location will be synced to the public open https://tracker.transistorsoft.com/fbk_dslab
      const debugTokenForPublicServer =
        await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(
          'fbk_dslab',
          'mmikula'
        );

      const config: Config = {
        transistorAuthorizationToken: debugTokenForPublicServer,
        distanceFilter: 10, // <-- your config options as desired
        stopOnTerminate: false,
        startOnBoot: false,
        autoSync: false,
      };
      console.log('starting BackgroundGeolocation', config);
      const state = await BackgroundGeolocation.ready(config);
      console.log('BackgroundGeolocation ready', state);
    } catch (e) {
      console.error(e);
    }
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.tripPersistanceService.initialTripNotPresent$.subscribe(() => {
      // we maybe have some not synchronized location in the plugin
      BackgroundGeolocation.sync();
    });
    // this.extras$.subscribe(console.log);
    this.extras$.subscribe(async (extras) => {
      console.log('BackgroundGeolocation.setConfig({ extras });', extras);
      BackgroundGeolocation.setConfig({ extras });
      try {
        console.log('BackgroundGeolocation.getCurrentPosition()');
        await BackgroundGeolocation.getCurrentPosition({
          extras: { ...extras, forced: true },
        });
      } catch (e) {
        console.error('BackgroundGeolocation.getCurrentPosition() --> failed');
      }
    });

    this.tripService.tripStart$.subscribe((trip) => {
      try {
        console.log('BackgroundGeolocation.start();');
        BackgroundGeolocation.start();
      } catch (e) {
        console.error(e);
      }
    });
    this.tripService.tripEnd$.subscribe(async (trip) => {
      try {
        console.log('BackgroundGeolocation.stop();');
        await BackgroundGeolocation.stop();
        console.log('BackgroundGeolocation.sync();');
        await BackgroundGeolocation.sync();
      } catch (e) {
        console.error(e);
      }
    });
  }
}

interface TripExtras extends Extras, TripPart {}
