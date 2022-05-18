import { Injectable } from '@angular/core';
import { identity, Observable, ReplaySubject } from 'rxjs';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { NO_TRIP_STARTED, Trip, TripPart, TRIP_END } from './trip.model';
import { isConstant, isNotConstant } from '../utils';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class LocationsStorageService {
  private storage =
    this.localStorageService.getStorageOf<TripPart>('locations');

  private sourceTripPartsToStore = new ReplaySubject<
    Observable<TripPart | TRIP_END>
  >();
  private tripPartsToStore = this.sourceTripPartsToStore.pipe(
    mergeMap(identity)
  );

  constructor(private localStorageService: LocalStorageService) {
    this.tripPartsToStore.subscribe(this.storeOrClearTrip.bind(this));
  }

  //we have to pass observable manually, to avoid circular dependency in DI.
  storeLastOf(tripPart$: Observable<TripPart | TRIP_END>) {
    this.sourceTripPartsToStore.next(tripPart$);
  }

  private storeOrClearTrip(tripPart: TripPart | TRIP_END) {
    if (tripPart === TRIP_END) {
      this.storage.set(null);
    } else {
      this.storage.set(tripPart);
    }
  }

  public getInitialTrip(): TripPart | NO_TRIP_STARTED {
    const tripPart: TripPart = this.storage.get();
    if (tripPart === null) {
      return NO_TRIP_STARTED;
    }
    tripPart.isInitial = true;
    return tripPart;
  }
}
