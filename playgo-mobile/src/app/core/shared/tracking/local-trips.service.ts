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
  withLatestFromWithoutSkipping,
} from '../utils';
import { toServerDateTime } from '../time.utils';
import { LocalStorageService } from '../services/local-storage.service';
import { TrackControllerService } from '../../api/generated/controllers/trackController.service';
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';
import {
  BackgroundTrackingService,
  TripLocation,
} from './background-tracking.service';
import { AuthService } from '../../auth/auth.service';
import { RefresherService } from '../services/refresher.service';

@Injectable({
  providedIn: 'root',
})
export class InitServiceStream {
  get() {
    return of(undefined);
  }
}

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

  private explicitReload$: Observable<void> = this.refresherService.refreshed$;

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

  private networkStatusChanged$: Observable<void> = NEVER;

  private reloadPendingTrigger$: Observable<TriggerType> = merge(
    this.afterSyncTimer$,
    this.appResumed$,
    this.networkStatusChanged$,
    this.pushNotification$
  ).pipe(throttleTime(500), mapTo('RELOAD_ONLY_PENDING'));

  private reloadFromLastTripTrigger$: Observable<TriggerType> = merge(
    this.authService.isReadyForApi$
  ).pipe(mapTo('RELOAD_FROM_LAST_TRIP'));

  private reloadAllTrigger$: Observable<TriggerType> = merge(
    this.explicitReload$
  ).pipe(mapTo('RELOAD_WHOLE_PERIOD'));

  private trigger$: Observable<TriggerType> = merge(
    this.reloadPendingTrigger$,
    this.reloadFromLastTripTrigger$,
    this.reloadAllTrigger$
  );

  private initialLocalData$ = defer(() =>
    this.getTripsFromStorage(this.localDataFromDate)
  );
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
              modeType: representativeLocation.transportType,
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
        trips.map((trip) => ({
          id: trip.clientId,
          status: 'syncedButNotReturnedFromServer',
          date: DateTime.fromMillis(trip.endTime).toISODate(),
          tripData: trip,
        }))
      )
    );

  private dataFromServer$: Observable<StorableTrip[]> = this.trigger$.pipe(
    withLatestFromWithoutSkipping(this.lastLocalData$),
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

    shareReplay(1)
  );

  public localDataChanges$: Observable<StorableTrip[]> = this.localData$.pipe(
    distinctUntilChanged(isEqual)
  );

  public newTripsTrigger$: Observable<void> = this.localData$.pipe(
    // this should be the trigger which caused the localData$ to change, not last trigger, but it is close enough
    withLatestFrom(this.trigger$),
    map(([data, isForceTrigger]) => ({ data, isForceTrigger })),
    distinctUntilChanged((previous, current) => {
      if (!current || !previous) {
        return false;
      }
      if (current.isForceTrigger) {
        return false;
      }
      return isEqual(current.data, previous.data);
    }),
    mapTo(undefined)
  );

  constructor(
    private initStream: InitServiceStream,
    private localStorageService: LocalStorageService,
    private trackControllerService: TrackControllerService,
    private backgroundTrackingService: BackgroundTrackingService,
    private authService: AuthService,
    private refresherService: RefresherService
  ) {
    initStream.get().subscribe(() => {
      this.initService();
    });
  }

  private initService() {
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

    return this.trackControllerService
      .getTrackedInstanceInfoListUsingGET({
        page: 0,
        size: 10000,
        dateFrom: toServerDateTime(from),
        dateTo: toServerDateTime(to),
      })
      .pipe(
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
        catchError((e) => of([]))
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
    const fromDate = {
      forWholePeriod: this.localDataFromDate,
      forEmptyPeriod: NOW,
    };
    if (triggerType === 'RELOAD_WHOLE_PERIOD') {
      return fromDate.forWholePeriod;
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

    if (triggerType === 'RELOAD_FROM_LAST_TRIP') {
      const oldestTripDate = findOldest([
        oldestPendingTripDate,
        newestNotPendingTripDate,
      ]);

      return oldestTripDate || fromDate.forWholePeriod;
    }

    if (triggerType === 'RELOAD_ONLY_PENDING') {
      return oldestPendingTripDate || fromDate.forEmptyPeriod;
    }

    return this.localDataFromDate;
  }

  private async getTripsFromStorage(
    fromDateFilter: DateTime
  ): Promise<StorableTrip[]> {
    const tripsFromStorage = (await this.storage.get()) || [];

    return tripsFromStorage.filter(
      // TODO: check for +-1 errors. Otherwise, we could have same trip loaded twice.
      // once from local trips, once from paging.
      (trip) => fromDateFilter < DateTime.fromISO(trip.date)
    );
  }

  private storeTripsToStorage(trips: StorableTrip[]): void {
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
