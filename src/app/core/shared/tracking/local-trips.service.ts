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
  concatMap,
  distinctUntilChanged,
  map,
  shareReplay,
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
import { groupByConsecutiveValues } from '../utils';
import { mapTo, startFrom, withReplayedLatestFrom } from '../rxjs.utils';
import { toServerDateTime } from '../time.utils';
import { LocalStorageService } from '../services/local-storage.service';
import { TrackedInstanceInfo } from '../../api/generated/model/trackedInstanceInfo';
import {
  BackgroundTrackingService,
  TripLocation,
} from './background-tracking.service';
import { AuthService } from '../../auth/auth.service';
import { RefresherService } from '../services/refresher.service';
import { TrackApiService } from './track-api.service';
import { PushNotificationService } from '../services/notifications/pushNotification.service';

@Injectable({
  providedIn: 'root',
})
/** Needed for delaying start in case of testing */
export class InitServiceStream {
  get() {
    return of(undefined);
  }
}

@Injectable({
  providedIn: 'root',
})
/**
 * This service is responsible for providing most recent trips.
 *
 * After backgroundGeolocation plugin sync was called, the trips are not yet
 * available in the API. This service is responsible for smartly polling the API until
 * these "pending" trips are available.
 *
 * Service keeps list of trips, which some of them are pending. And will call the API
 * on these triggers:
 * - reloadPendingTrigger. When this is triggered, the service will reload all pending trips.
 *        This is triggered few times after each sync, after push notifications,
 *        after app is resumed (todo), and after network is back online (todo).
 * - reloadFromLastTripTrigger. Load trips from last trip in the list. This is triggered
 *       in the app start - to fill any trips that could be tracked on different device.
 * - reloadAllTrigger. This is triggered when user explicitly requests to reload all trips.
 *
 * The trips are also cached in local storage, so that the app can be used offline.
 */
export class LocalTripsService {
  private storage =
    this.localStorageService.getStorageOf<StorableTrip[]>('trips');

  /** Specify interval on which LocalTripsService works */
  public localDataFromDate = DateTime.local()
    // .minus({ month: 1 })
    .minus({ days: 7 })
    .toUTC()
    .startOf('day');

  private justSynchronizedLocations$ =
    this.backgroundTrackingService.synchronizedLocations$;

  private explicitReload$: Observable<void> = this.refresherService.refreshed$;

  /** After backgroundGeolocation plugin sync was called, we ask server multiple
   * times, to see if synced trips are already available and validated. */
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

  private pushNotification$: Observable<void> =
    this.pushNotificationService.notifications$.pipe(mapTo(undefined));

  private appResumed$: Observable<void> = NEVER;

  private networkStatusChanged$: Observable<void> = NEVER;

  /** Contains all triggers, for which we will ask server to check on
   * pending trips. */
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
  ).pipe(shareReplay({ refCount: false, bufferSize: 100 }));

  private initialLocalData$ = defer(() =>
    this.getTripsFromStorage(this.localDataFromDate)
  );
  private localDataSubject: Subject<StorableTrip[]> = new Subject();
  private lastLocalData$: Observable<StorableTrip[]> = concat(
    this.initialLocalData$,
    this.localDataSubject
  ).pipe(shareReplay({ refCount: false, bufferSize: 1 }));

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
    withReplayedLatestFrom(this.lastLocalData$),
    map(([triggerType, lastLocalData]) =>
      this.findPeriodFromDate(lastLocalData, triggerType)
    ),
    concatMap((periodFromDate) => this.loadDataFromServer(periodFromDate)),
    shareReplay(1)
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
    private trackApiService: TrackApiService,
    private backgroundTrackingService: BackgroundTrackingService,
    private authService: AuthService,
    private refresherService: RefresherService,
    private pushNotificationService: PushNotificationService
  ) {
    this.initStream.get().subscribe(() => {
      this.initService();
    });
  }

  private initService() {
    this.lastLocalData$.subscribe();
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

    // console.log(
    //   `LT: Loading trips from ${from.toFormat(
    //     'dd MM yyyy HH:mm'
    //   )} to ${to.toFormat('dd MM yyyy HH:mm')}`
    // );
    return this.trackApiService
      .getTrackedInstanceInfoList({
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
    const onlyLongServerOrPluginTrips = serverOrPluginTrips.filter(
      (serverOrPluginTrip) => Math.ceil((serverOrPluginTrip?.tripData?.endTime - serverOrPluginTrip?.tripData?.startTime) / 1000) > 15
    )
    const onlyLongLocalOnlyTrips = localOnlyTrips.filter(
      (localOnlyTrip) => Math.ceil((localOnlyTrip?.tripData?.endTime - localOnlyTrip?.tripData?.startTime) / 1000) > 15
    )
    return this.sortTrips([...onlyLongServerOrPluginTrips, ...onlyLongLocalOnlyTrips]);
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
      const reloadFromLastTime = oldestTripDate || fromDate.forWholePeriod;
      // console.log(
      //   'LT: processing RELOAD_FROM_LAST_TRIP',
      //   oldestTripDate ? 'oldest trip' : 'whole period',
      //   reloadFromLastTime.toFormat('dd MM yyyy HH:mm:ss')
      // );

      return reloadFromLastTime;
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
