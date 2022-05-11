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
import { isEqual, some, sortBy } from 'lodash-es';
import { startFrom, tapLog } from '../utils';

const debugTriggers = {
  hard: new Subject<any>(),
  soft: new Subject<any>(),
};
const debugRefTime = DateTime.now();

(window as any).debugTriggers = debugTriggers;

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
    this.afterSyncTimer$.pipe(tapLog('this.afterSyncTimer')),
    // this.appStateChanged$.pipe(tapLog('this.appStateChanged')),
    this.networkStatusChanged$.pipe(tapLog('this.networkStatusChanged')),
    this.pushNotification$.pipe(tapLog('this.pushNotification')),
    debugTriggers.soft.pipe(tapLog('debugTriggers.soft'))
  ).pipe(throttleTime(500));

  private hardTrigger$: Observable<void> = merge(
    this.explicitReload$,
    debugTriggers.hard
  );

  private trigger$: Observable<boolean> = merge(
    this.softTrigger$.pipe(mapTo(false)),
    this.hardTrigger$.pipe(mapTo(true))
  ).pipe();

  private initialLocalData$: Observable<Trip[]> = of(
    this.getTripsFromStorage()
  );
  private localDataSubject: Subject<Trip[]> = new Subject();
  private lastLocalData$: Observable<Trip[]> = concat(
    this.initialLocalData$, //we maybe do not need this, because of the tap after startFrom
    this.localDataSubject
  );

  public localData$: Observable<any> = this.trigger$.pipe(
    tapLog('LT: trigger$'),
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
    distinctUntilChanged((a, b) => {
      const res = isEqual(a, b);
      console.log('LT: distinctUntilChanged', a, b, res);
      return res;
    }),
    tap((value) => {
      this.localDataSubject.next(value);
    }),
    tapLog('LT: localData$'),
    shareReplay(1)
  );

  public newTripsTrigger$: Observable<void> = this.localData$.pipe(
    mapTo(undefined)
  );

  constructor() {
    this.localData$.subscribe((trips) => {
      this.storeTripsToStorage(trips);
    });
  }

  private loadDataFromServer(from: DateTime, to: DateTime): Observable<Trip[]> {
    console.log('LT: loadDataFromServer');
    return of([
      {
        status: 'returnedFromServer',
        id: 0,
        data: 'zero',
        date: debugRefTime.minus({ days: 1 }).toJSDate(),
      },
      {
        status: 'returnedFromServer',
        id: 1,
        data: 'one',
        date: debugRefTime.minus({ days: 2 }).toJSDate(),
      },
    ]);
  }

  private pairPendingTrips(localTrips: Trip[], serverTrips: Trip[]): Trip[] {
    const localOnlyTrips = localTrips.filter(
      (localTrip) => !some(serverTrips, { id: localTrip.id })
    );
    const newLocalData = sortBy([...serverTrips, ...localOnlyTrips], 'date');
    return newLocalData;
  }

  private findLastPendingTripDate(trips: Trip[]): DateTime | undefined {
    const lastPendingTrip = trips.find(
      (trip) => trip.status === 'syncButNotReturnedFromServer'
    );
    if (lastPendingTrip) {
      return DateTime.fromJSDate(lastPendingTrip.date);
    }
    return undefined;
  }

  private getTripsFromStorage(): Trip[] {
    return [
      {
        status: 'syncButNotReturnedFromServer',
        id: 0,
        date: debugRefTime.minus({ days: 1 }).toJSDate(),
      },
      {
        status: 'returnedFromServer',
        id: 1,
        data: 'one',
        date: debugRefTime.minus({ days: 2 }).toJSDate(),
      },
    ];
  }

  private storeTripsToStorage(trips: Trip[]): void {
    console.log('LT: storeTripsToStorage', trips);
  }
}

interface Trip {
  status: 'syncButNotReturnedFromServer' | 'returnedFromServer';
  date: Date;
  data?: string;
  id: number;
}
