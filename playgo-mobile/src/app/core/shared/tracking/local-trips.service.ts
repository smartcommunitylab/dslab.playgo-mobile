import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
  BehaviorSubject,
  concat,
  defer,
  merge,
  NEVER,
  Observable,
  of,
  ReplaySubject,
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
import {
  find,
  findLast,
  first,
  isEqual,
  last,
  min,
  minBy,
  some,
  sortBy,
} from 'lodash-es';
import {
  groupByConsecutiveValues,
  startFrom,
  tapLog,
  toServerDateTime,
} from '../utils';
import { LocalStorageService } from '../services/local-storage.service';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';
import {
  BackgroundTrackingService,
  TripLocation,
} from './background-tracking.service';
import { AppStatusService } from '../services/app-status.service';

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
    // .minus({ month: 1 })
    .minus({ days: 7 })
    .toUTC()
    .startOf('day');

  private justSynchronizedLocations$ =
    this.backgroundTrackingService.synchronizedLocations$;

  private explicitReload$: Observable<void> = NEVER;

  private afterSyncTimer$: Observable<void> =
    this.justSynchronizedLocations$.pipe(
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
  private appStateChanged$: Observable<void> = merge(
    this.appResumed$,
    this.appStatusService.appReady$
  );

  private networkStatusChanged$: Observable<void> = NEVER;

  private softTrigger$: Observable<TriggerType> = merge(
    this.afterSyncTimer$.pipe(tapLog('LT: this.afterSyncTimer')),
    this.appStateChanged$.pipe(tapLog('LT: this.appStateChanged')),
    this.networkStatusChanged$.pipe(tapLog('LT: this.networkStatusChanged')),
    this.pushNotification$.pipe(tapLog('LT: this.pushNotification')),
    debugTriggers.soft.pipe(tapLog('LT: debugTriggers.soft'))
  ).pipe(throttleTime(500), mapTo('RELOAD_ONLY_PENDING'));

  private hardTrigger$: Observable<TriggerType> = merge(
    this.explicitReload$,
    debugTriggers.hard
  ).pipe(mapTo('RELOAD_WHOLE_PERIOD'));

  private trigger$: Observable<TriggerType> = merge(
    this.softTrigger$,
    this.hardTrigger$
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

  private dataFromPluginDB$: Observable<StorableTrip[]> =
    this.justSynchronizedLocations$.pipe(
      map((synchronizedLocations: TripLocation[]) => {
        const tripLocations = synchronizedLocations.filter(
          (location) => location.idTrip
        );
        return groupByConsecutiveValues(tripLocations, 'idTrip').map(
          ({ group, values }) => {
            const idTrip = group;
            const locations = values;
            const representativeLocation = first(locations);
            const trip: TrackedInstanceInfo = {
              campaigns: [],
              distance: 0,
              startTime: first(locations).date,
              endTime: last(locations).date,
              modeType: group,
              multimodalId: representativeLocation.multimodalId,
              polyline: '',
              trackedInstanceId: `localId_${idTrip}`,
              validity: null,
              clientId: idTrip,
            };
            return trip;
          }
        );
      }),
      map((trips: TrackedInstanceInfo[]) =>
        //id: string;
        //status: 'inPluginDB' | 'syncedButNotReturnedFromServer' | 'fromServer';
        //date: string;
        //tripData?: TrackedInstanceInfo;

        trips.map((trip) => ({
          id: trip.clientId,
          status: 'syncedButNotReturnedFromServer',
          date: DateTime.fromJSDate(trip.endTime).toISODate(),
          tripData: trip,
        }))
      )
    );

  private dataFromServer$: Observable<StorableTrip[]> = this.trigger$.pipe(
    tapLog('LT: trigger$'),
    withLatestFrom(this.lastLocalData$),
    map(([triggerType, lastLocalData]) =>
      this.findPeriodFromDate(lastLocalData, triggerType)
    ),
    switchMap((periodFromDate) => this.loadDataFromServer(periodFromDate))
  );

  private localData$: Observable<any> = merge(
    this.dataFromServer$,
    this.dataFromPluginDB$
  ).pipe(
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
    private appStatusService: AppStatusService,
    private localStorageService: LocalStorageService,
    private trackControllerService: TrackControllerService,
    private backgroundTrackingService: BackgroundTrackingService
  ) {
    console.log('TEST', initStream);
    initStream.get().subscribe(() => {
      this.initService();
    });
  }

  private initService() {
    console.log('LT: initService triggered!!');
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
        toServerDateTime(from) as unknown as Date,
        null,
        toServerDateTime(to) as unknown as Date
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
    lastLocalTrips: StorableTrip[],
    serverOrPluginTrips: StorableTrip[]
  ): StorableTrip[] {
    const localOnlyTrips = lastLocalTrips.filter(
      (localTrip) => !some(serverOrPluginTrips, { id: localTrip.id })
    );
    return this.sortTrips([...serverOrPluginTrips, ...localOnlyTrips]);
  }

  private sortTrips(trips: StorableTrip[]): StorableTrip[] {
    // sort by date. First the ones with the most recent date, then the ones with the oldest date
    // aka: sort desc by timestamp
    return sortBy(trips, (trip) => -DateTime.fromISO(trip.date).valueOf());
  }

  private findPeriodFromDate(
    trips: StorableTrip[],
    triggerType: TriggerType
  ): DateTime | NOW {
    if (triggerType === 'RELOAD_WHOLE_PERIOD') {
      return this.localDataFromDate;
    }

    // find oldest pending trip - aka with last index
    const oldestPendingTrip = findLast(trips, {
      status: 'syncedButNotReturnedFromServer',
    });

    let oldestPendingTripDate = null;
    if (oldestPendingTrip) {
      oldestPendingTripDate = DateTime.fromISO(oldestPendingTrip.date).minus({
        minutes: 1,
      });
    }

    // find newest not pending trip - aka with first index
    const newestNotPendingTrip = find(trips, {
      status: 'fromServer',
    });

    let newestNotPendingTripDate = null;
    if (newestNotPendingTrip) {
      newestNotPendingTripDate = DateTime.fromISO(
        newestNotPendingTrip.date
      ).plus({
        minutes: 1,
      });
    }

    console.log(
      'oldestPendingTripDate',
      oldestPendingTripDate,
      oldestPendingTrip
    );
    console.log(
      'newestNotPendingTripDate',
      newestNotPendingTripDate,
      newestNotPendingTrip
    );

    if (triggerType === 'RELOAD_FROM_LAST_TRIP') {
      const oldestTripDate = findOldest([
        oldestPendingTripDate,
        newestNotPendingTripDate,
      ]);

      console.log('oldestTripDate', oldestTripDate);

      return oldestTripDate || this.localDataFromDate;
    }

    if (triggerType === 'RELOAD_ONLY_PENDING') {
      return oldestPendingTripDate || NOW;
    }

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

function findOldest(dates: DateTime[]): DateTime {
  return minBy(dates, (date) =>
    date ? date.valueOf() : Number.POSITIVE_INFINITY
  );
}

export interface StorableTrip {
  id: string;
  status: 'syncedButNotReturnedFromServer' | 'fromServer';
  date: string;
  tripData?: TrackedInstanceInfo;
}

const NOW = 'NOW' as const;
type NOW = typeof NOW;

type TriggerType =
  | 'RELOAD_WHOLE_PERIOD'
  | 'RELOAD_ONLY_PENDING'
  | 'RELOAD_FROM_LAST_TRIP';
