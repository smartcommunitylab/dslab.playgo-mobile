import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
  BehaviorSubject,
  concat,
  defer,
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
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';

@Injectable({
  providedIn: 'root',
})
export class InitServiceStream {
  get() {
    return of(undefined);
  }
}

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
  private storage =
    this.localStorageService.getStorageOf<StorableTrip[]>('trips');

  public localDataFromDate = DateTime.local()
    .minus({ month: 1 })
    .toUTC()
    .startOf('day');

  private explicitReload$: Observable<void> = NEVER;

  private syncedTrips: Observable<StorableTrip[]> = NEVER;
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

  private initialLocalData$ = defer(() => {
    const trips = this.getTripsFromStorage(this.localDataFromDate);
    return of(trips);
  });
  private localDataSubject: Subject<StorableTrip[]> = new Subject();
  private lastLocalData$: Observable<StorableTrip[]> = concat(
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

  public localDataChanges$: Observable<StorableTrip[]> = this.localData$.pipe(
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
    private initStream: InitServiceStream,
    private localStorageService: LocalStorageService,
    private trackControllerService: TrackControllerService
  ) {
    console.log('TEST', initStream);
    initStream.get().subscribe(() => {
      this.initService();
    });
  }

  private initService() {
    console.log('TEST: initService triggered!!');
    this.localDataChanges$.subscribe((trips) => {
      // for creating lastLocalData$ observable
      this.localDataSubject.next(trips);

      this.storeTripsToStorage(trips);
    });
  }

  private loadDataFromServer(from: DateTime | NOW): Observable<StorableTrip[]> {
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
            const localTrip: StorableTrip = {
              status: 'fromServer',
              date: new Date(serverTrip.endTime).toISOString(),
              id: serverTrip.clientId,
              tripData: serverTrip,
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

  private pairPendingTrips(
    localTrips: StorableTrip[],
    serverTrips: StorableTrip[]
  ): StorableTrip[] {
    const localOnlyTrips = localTrips.filter(
      (localTrip) => !some(serverTrips, { id: localTrip.id })
    );
    const newLocalData = sortBy([...serverTrips, ...localOnlyTrips], 'date');
    return newLocalData;
  }

  private findPeriodFromDate(trips: StorableTrip[]): DateTime | NOW {
    // take oldest pending trip
    const lastPendingTrip = find(trips, {
      status: 'syncedButNotReturnedFromServer',
    });
    if (lastPendingTrip) {
      console.log('LT: findPeriodFromDate: lastPendingTrip', lastPendingTrip);
      return DateTime.fromISO(lastPendingTrip.date);
    }
    // take newest not pending trip
    const firstNotPendingTrip = findLast(trips, {
      status: 'syncedButNotReturnedFromServer',
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

  private getTripsFromStorage(fromDateFilter: DateTime): StorableTrip[] {
    const tripsFromStorage = this.storage.get() || [];

    return tripsFromStorage.filter(
      // TODO: check for +-1 errors. Otherwise, we could have same trip loaded twice.
      // once from local trips, once from paging.
      (trip) => fromDateFilter < DateTime.fromISO(trip.date)
    );
  }

  private storeTripsToStorage(trips: StorableTrip[]): void {
    console.log('LT: storeTripsToStorage', trips);
    this.storage.set(trips);
  }
}

export interface StorableTrip {
  id: string;
  status: 'inPluginDB' | 'syncedButNotReturnedFromServer' | 'fromServer';
  date: string;
  tripData?: TrackedInstanceInfo;
}

const NOW = 'NOW' as const;
type NOW = typeof NOW;
