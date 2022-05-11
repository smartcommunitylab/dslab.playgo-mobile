import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  concat,
  merge,
  NEVER,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  mapTo,
  shareReplay,
  startWith,
  switchMap,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { intervalBackoff } from 'backoff-rxjs';
import { DateTime } from 'luxon';
import { isEqual } from 'lodash-es';
import { startFrom } from '../utils';

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

  initialLocalData$: Observable<Trip[]> = of(this.getTripsFromStorage());
  localDataSubject: Subject<Trip[]> = new Subject();
  lastLocalData$: Observable<Trip[]> = concat(
    this.initialLocalData$, //we maybe do not need this, because of the tap after startFrom
    this.localDataSubject
  );

  localData$ = this.trigger$.pipe(
    // startWith(this.initialLocalData$),

    withLatestFrom(this.lastLocalData$),
    map(([force, lastLocalData]) =>
      force
        ? this.localDataToDate
        : this.findLastPendingTripDate(lastLocalData) || this.localDataToDate
    ),
    switchMap((periodToDate) =>
      this.loadDataFromServer(DateTime.now(), periodToDate)
    ),
    withLatestFrom(this.lastLocalData$),
    map(([newData, lastLocalData]) =>
      this.pairPendingTrips(lastLocalData, newData)
    ),
    startFrom(this.initialLocalData$),
    distinctUntilChanged((a, b) => isEqual(a, b)),
    tap((value) => {
      this.localDataSubject.next(value);
    }),
    shareReplay(1)
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
