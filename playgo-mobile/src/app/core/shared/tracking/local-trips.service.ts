import { Injectable } from '@angular/core';
import { merge, NEVER, Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  startWith,
  switchMap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { intervalBackoff } from 'backoff-rxjs';
import { DateTime } from 'luxon';
import { isEqual } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class LocalTripsService {
  private localDataToDate = DateTime.local().minus({ month: 1 });

  private explicitReload$: Observable<void> = NEVER;

  private syncedTrips: Observable<Trip[]> = NEVER;
  private afterSyncTimer$: Observable<void> = this.syncedTrips.pipe(
    switchMap(() =>
      intervalBackoff({
        initialInterval: 1000,
        maxInterval: 30 * 1000,
      })
    ),
    mapTo(undefined)
  );

  private pushNotification$: Observable<void> = NEVER;

  private appResumed$: Observable<void> = NEVER;
  private appStateChanged$: Observable<void> = this.appResumed$.pipe(
    startWith(undefined as void)
  );

  private networkStatusChanged$: Observable<void> = NEVER;

  private softTrigger$: Observable<void> = merge(
    this.afterSyncTimer$,
    this.appStateChanged$,
    this.networkStatusChanged$,
    this.pushNotification$
  ).pipe(throttleTime(500));

  private hardTrigger$: Observable<void> = this.explicitReload$;

  private trigger$: Observable<boolean> = merge(
    this.softTrigger$.pipe(mapTo(false)),
    this.hardTrigger$.pipe(mapTo(true))
  );

  localData$: Observable<Trip[]> = this.trigger$.pipe(
    startWith(this.getTripsFromStorage()),
    withLatestFrom(this.localData$),
    map(([force, lastLocalData]) =>
      force
        ? this.localDataToDate
        : this.findLastPendingTripDate(lastLocalData) || this.localDataToDate
    ),
    switchMap((periodToDate) =>
      this.loadDataFromServer(DateTime.now(), periodToDate)
    ),
    withLatestFrom(this.localData$),
    map(([newData, lastLocalData]) =>
      this.pairPendingTrips(lastLocalData, newData)
    ),
    distinctUntilChanged(isEqual)
  );

  constructor() {
    this.localData$.subscribe((trips) => {
      this.storeTripsToStorage(trips);
    });
  }

  loadDataFromServer(from: DateTime, to: DateTime): Observable<Trip[]> {
    return of([]);
  }

  pairPendingTrips(localTrips: Trip[], serverTrips: Trip[]): Trip[] {
    return [];
  }

  findLastPendingTripDate(trips: Trip[]): DateTime | undefined {
    const lastPendingTrip = trips.find(
      (trip) => trip.status === 'syncButNotReturnedFromServer'
    );
    if (lastPendingTrip) {
      return DateTime.fromJSDate(lastPendingTrip.date);
    }
    return undefined;
  }

  getTripsFromStorage(): Trip[] {
    return [];
  }

  storeTripsToStorage(trips: Trip[]): void {}
}

type Trip = {
  status: 'syncButNotReturnedFromServer' | 'returnedFromServer';
  date: Date;
  a: number;
};
