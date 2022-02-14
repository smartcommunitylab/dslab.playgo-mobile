/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { NO_TRIP_STARTED, TripPart, TRIP_END } from './trip.model';
import { isNotConstant } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TripPersistanceService {
  private readonly localStorageKey = 'playgo-mobile';
  private storage = new Storage<TripPart>(this.localStorageKey);

  private initialTripSubject = new ReplaySubject<TripPart | NO_TRIP_STARTED>();
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
    this.tripPartsToStore.subscribe(this.storeOrClearTrip.bind(this));

    this.initialTripSubject.next(this.readTrip());
    this.initialTripSubject.complete();
  }

  //we have to pass observable manually, to avoid circular dependency in DI.
  storeLastOf(tripPart$: Observable<TripPart | TRIP_END>) {
    this.sourceTripPartsToStore.next(tripPart$);
  }

  private storeOrClearTrip(tripPart) {
    if (tripPart === TRIP_END) {
      this.clearTrip();
    } else {
      this.storeTrip(tripPart);
    }
  }
  private clearTrip() {
    this.storage.set('mean', null);
    this.storage.set('multimodalId', null);
    this.storage.set('started', null);
  }
  private storeTrip(tripPart: TripPart) {
    this.storage.set('mean', tripPart.mean);
    this.storage.set('multimodalId', tripPart.multimodalId);
    this.storage.set('started', tripPart.started);
  }

  private readTrip(): TripPart | NO_TRIP_STARTED {
    const mean = this.storage.get('mean');
    const multimodalId = this.storage.get('multimodalId');
    const started = this.storage.get('started');

    if (multimodalId) {
      return new TripPart({ mean, started, multimodalId });
    }
    return NO_TRIP_STARTED;
  }
}

class Storage<T> {
  constructor(private localStorageKey: string) {}
  set<K extends keyof T>(key: K, value: T[K]) {
    localStorage.setItem(
      this.localStorageKey + '_' + key,
      JSON.stringify(value)
    );
  }
  get<K extends keyof T>(key: K): T[K] {
    const stringVal = localStorage.getItem(this.localStorageKey + '_' + key);
    return JSON.parse(stringVal);
  }
}
