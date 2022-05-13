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
  catchError,
  delay,
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
import { find, findLast, isEqual, some, sortBy } from 'lodash-es';
import { startFrom, tapLog, toServerDateTime } from '../utils';
import { LocalStorageService } from '../local-storage.service';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';

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
  private storage = this.localStorageService.getStorageOf<Trip[]>('trips');

  public localDataFromDate = DateTime.local()
    .minus({ month: 1 })
    .toUTC()
    .startOf('day');

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
    this.appStateChanged$.pipe(tapLog('this.appStateChanged')),
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
    this.getTripsFromStorage(this.localDataFromDate)
  );
  private localDataSubject: Subject<Trip[]> = new Subject();
  private lastLocalData$: Observable<Trip[]> = concat(
    this.initialLocalData$,
    this.localDataSubject
  );

  private localData$: Observable<any> = this.trigger$.pipe(
    tapLog('LT: trigger$'),
    withLatestFrom(this.lastLocalData$),
    map(([force, lastLocalData]) =>
      force ? this.localDataFromDate : this.findPeriodFromDate(lastLocalData)
    ),
    switchMap((periodFromDate) => this.loadDataFromServer(periodFromDate)),
    withLatestFrom(this.lastLocalData$),
    map(([newData, lastLocalData]) =>
      this.pairPendingTrips(lastLocalData, newData)
    ),
    startFrom(this.initialLocalData$),

    tapLog('LT: localData$'),
    shareReplay(1)
  );

  public localDataChanges$: Observable<Trip[]> = this.localData$.pipe(
    distinctUntilChanged((a, b) => {
      const res = isEqual(a, b);
      console.log('LT: distinctUntilChanged - local data', a, b, res);
      return res;
    }),
    tapLog('LT: localDataChanges$')
  );

  public newTripsTrigger$: Observable<void> = this.localData$.pipe(
    // this should be the trigger which caused the localData$ to change, not last trigger, but it is close enough
    withLatestFrom(this.trigger$),
    map(([data, isForceTrigger]) => ({ data, isForceTrigger })),
    distinctUntilChanged((previous, current) => {
      console.log('LT: distinctUntilChanged - trigger', current, previous);
      if (!current || !previous) {
        console.log('LT: distinctUntilChanged - trigger', false, 0);

        return false;
      }
      if (current.isForceTrigger) {
        console.log('LT: distinctUntilChanged - trigger', false, 1);
        return false;
      }
      console.log(
        'LT: distinctUntilChanged - trigger',
        isEqual(current.data, previous.data),
        2
      );
      return isEqual(current.data, previous.data);
    }),
    mapTo(undefined)
  );

  constructor(
    private localStorageService: LocalStorageService,
    private trackControllerService: TrackControllerService
  ) {
    this.localDataChanges$.subscribe((trips) => {
      // for creating lastLocalData$ observable
      this.localDataSubject.next(trips);

      this.storeTripsToStorage(trips);
    });
  }

  private loadDataFromServer(from: DateTime | NOW): Observable<Trip[]> {
    const nowDateTime = DateTime.local();
    const to = nowDateTime;

    if (from === NOW) {
      // no pending trips
      return of([]);
    }

    console.log(
      'LT: loadDataFromServer',
      toServerDateTime(from),
      toServerDateTime(to)
    );

    return this.trackControllerService
      .getTrackedInstanceInfoListUsingGET(
        0,
        10000,
        toServerDateTime(from),
        null,
        toServerDateTime(to)
      )
      .pipe(
        tapLog('LT: data from server!'),
        map((pageResult) => pageResult.content),
        map((serverTrips) =>
          serverTrips.map((serverTrip) => {
            const localTrip: Trip = {
              ...serverTrip,
              status: 'returnedFromServer',
              date: new Date(serverTrip.endTime).toISOString(),
              data: serverTrip,
              trackedInstanceId: serverTrip.trackedInstanceId,
            };
            return localTrip;
          })
        ),
        catchError((e) => {
          console.error(
            'LT: loading of some part of last month of trips failed!',
            e
          );
          return of([]);
        })
      );
  }

  private pairPendingTrips(localTrips: Trip[], serverTrips: Trip[]): Trip[] {
    const localOnlyTrips = localTrips.filter(
      (localTrip) =>
        !some(serverTrips, { trackedInstanceId: localTrip.trackedInstanceId })
    );
    const newLocalData = sortBy([...serverTrips, ...localOnlyTrips], 'date');
    return newLocalData;
  }

  private findPeriodFromDate(trips: Trip[]): DateTime | NOW {
    // take oldest pending trip
    const lastPendingTrip = find(trips, {
      status: 'syncButNotReturnedFromServer',
    });
    if (lastPendingTrip) {
      console.log('LT: findPeriodFromDate: lastPendingTrip', lastPendingTrip);
      return DateTime.fromISO(lastPendingTrip.date);
    }
    // take newest not pending trip
    const firstNotPendingTrip = findLast(trips, {
      status: 'returnedFromServer',
    });

    if (firstNotPendingTrip) {
      console.log(
        'LT: findPeriodFromDate: firstNotPendingTrip',
        firstNotPendingTrip
      );
      return DateTime.fromISO(firstNotPendingTrip.date).plus({
        millisecond: 1,
      });
    }

    console.log('LT: findPeriodFromDate: whole period');
    return this.localDataFromDate;
  }

  private getTripsFromStorage(fromDateFilter: DateTime): Trip[] {
    const tripsFromStorage = this.storage.get() || [];

    return tripsFromStorage.filter(
      // TODO: check for +-1 errors. Otherwise, we could have same trip loaded twice.
      // once from local trips, once from paging.
      (trip) => fromDateFilter < DateTime.fromISO(trip.date)
    );
  }

  private storeTripsToStorage(trips: Trip[]): void {
    console.log('LT: storeTripsToStorage', trips);
    this.storage.set(trips);
  }
}

interface Trip {
  status: 'syncButNotReturnedFromServer' | 'returnedFromServer';
  date: string;
  data?: any;
  trackedInstanceId: string;
}

const NOW = 'NOW' as const;
type NOW = typeof NOW;
