/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { NO_TRIP_STARTED, Trip, TripPart, TRIP_END } from './trip.model';
import { isConstant, isNotConstant } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripPersistanceService {
  private readonly localStorageKey = 'playgo-mobile';
  private storage = new Storage<TripPart & Trip>(this.localStorageKey);

  private initialTripSubject = new ReplaySubject<TripPart | NO_TRIP_STARTED>();
  public initialTripNotPresent$ = this.initialTripSubject.pipe(
    filter(isConstant(NO_TRIP_STARTED))
  );
  public initialTrip$: Observable<TripPart> = this.initialTripSubject.pipe(
    filter(isNotConstant(NO_TRIP_STARTED))
  );

  private sourceTripPartsToStore = new ReplaySubject<
    Observable<TripPart | TRIP_END>
  >();
  private tripPartsToStore = this.sourceTripPartsToStore.pipe(
    mergeMap((trip$) => trip$)
  );

  constructor() {
    this.initialTripSubject.next(this.readTrip());
    this.initialTripSubject.complete();
  }
  public start() {
    // TODO: better to pass trip service manually?
    this.tripPartsToStore.subscribe(this.storeOrClearTrip.bind(this));
  }
  //we have to pass observable manually, to avoid circular dependency in DI.
  storeLastOf(tripPart$: Observable<TripPart | TRIP_END>) {
    this.sourceTripPartsToStore.next(tripPart$);
  }

  private storeOrClearTrip(tripPart) {
    if (tripPart === TRIP_END) {
      this.storage.set(null);
    } else {
      this.storage.set(tripPart);
    }
  }

  private readTrip(): TripPart | NO_TRIP_STARTED {
    const tripPart: TripPart = this.storage.get();
    return tripPart || NO_TRIP_STARTED;
  }
}

class Storage<T> {
  constructor(private localStorageKey: string) {}
  set(data: T) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(data || null));
  }
  get(): T {
    const stringVal = localStorage.getItem(this.localStorageKey);
    return JSON.parse(stringVal);
  }
}
