import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { TripService } from './trip.service';
import BackgroundGeolocation, {
  Extras,
} from '@transistorsoft/capacitor-background-geolocation';
import { map } from 'rxjs/operators';
import { TRIP_END } from './trip.model';

@Injectable({
  providedIn: 'root',
})
export class BackgroundTrackingService {
  private isReady$ = new ReplaySubject<void>();

  private extras$: Observable<TripExtras> = this.tripService.trip$.pipe(
    map((tripOrTripEnd) => {
      if (tripOrTripEnd === TRIP_END) {
        return {
          tripId: null,
        };
      }
      return {
        tripId: tripOrTripEnd.tripId,
      };
    })
  );
  constructor(private tripService: TripService) {}

  async start() {
    const config = {};
    console.log('starting BackgroundGeolocation', config);
    const state = await BackgroundGeolocation.ready(config);
    console.log('BackgroundGeolocation ready', state);
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.extras$.subscribe((extras) => {
      console.log('BackgroundGeolocation.setConfig({ extras });', extras);
      BackgroundGeolocation.setConfig({ extras });
    });
    this.tripService.tripStart$.subscribe((trip) => {
      console.log('BackgroundGeolocation.start();');
      BackgroundGeolocation.start();
    });
    this.tripService.tripEnd$.subscribe((trip) => {
      console.log('BackgroundGeolocation.stop();');
      BackgroundGeolocation.stop();
    });
  }
}

interface TripExtras extends Extras {
  tripId: string;
}
