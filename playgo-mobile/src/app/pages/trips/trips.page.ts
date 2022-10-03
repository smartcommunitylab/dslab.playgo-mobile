import {
  AfterViewInit,
  Component,
  OnInit,
  TrackByFunction,
} from '@angular/core';
import {
  clone,
  cloneDeep,
  first,
  isEqual,
  last,
  some,
  sortBy,
} from 'lodash-es';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  firstValueFrom,
  from,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  PageableRequest,
  PageableResponse,
} from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import {
  TransportType,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import {
  groupByConsecutiveValues,
  isOfflineError,
  trackByProperty,
} from 'src/app/core/shared/utils';
import {
  toServerDateOnly,
  toServerDateTime,
} from 'src/app/core/shared/time.utils';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import {
  BackgroundTrackingService,
  TripLocation,
} from 'src/app/core/shared/tracking/background-tracking.service';
import { TripService } from 'src/app/core/shared/tracking/trip.service';
import { LocalTripsService } from 'src/app/core/shared/tracking/local-trips.service';
import { DateTime } from 'luxon';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { TrackApiService } from 'src/app/core/shared/tracking/track-api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit, AfterViewInit {
  transportTypeLabels = transportTypeLabels;
  scrollRequestSubject = new Subject<PageableRequest>();

  noMonthOrYearFormat: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  months$: Observable<Month[]> = from(this.getListOfMonths());

  monthFilterSubject = new BehaviorSubject<'NO_FILTER' | Month>('NO_FILTER');

  myCampaigns$ = this.campaignService.myCampaigns$;

  private routingCampaignFilter$: Observable<string> =
    this.activatedRoute.params.pipe(
      map((params) => params.id ?? 'NO_FILTER'),
      shareReplay(1)
    );

  campaignFilterSubject = new Subject<string>();

  campaignFilter$ = merge(
    this.routingCampaignFilter$,
    this.campaignFilterSubject
  ).pipe(shareReplay(1));

  private filterOptions$: Observable<FilterOptions> = combineLatest({
    campaignId: this.campaignFilter$,
    month: this.monthFilterSubject,
  }).pipe(shareReplay(1));

  campaignFilterStyle$ = combineLatest([
    this.campaignFilter$,
    this.myCampaigns$,
  ]).pipe(
    map(([campaignId, campaigns]) => {
      if (campaignId === 'NO_FILTER') {
        return undefined;
      }
      const campaign = campaigns.find(
        (c) => c?.campaign?.campaignId === campaignId
      );
      if (campaign) {
        return this.campaignService.getCampaignColor(campaign.campaign);
      }
    }),
    map((color) =>
      color
        ? {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'border-bottom': '5px solid',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'border-bottom-color': 'var(--ion-color-' + color + ')',
          }
        : {}
    )
  );

  resetItems$ = this.filterOptions$.pipe(map(() => Symbol()));

  tripsResponse$: Observable<PageableResponse<TrackedInstanceInfo>> =
    this.filterOptions$.pipe(
      switchMap((filterOptions) =>
        this.scrollRequestSubject.pipe(
          startWith({
            page: 0,
            size: 5,
          }),
          concatMap((scrollRequest) =>
            this.getTripsPage(scrollRequest, filterOptions).pipe(
              catchError((error) => {
                if (isOfflineError(error)) {
                  // TODO: show better UX
                  this.alertService.showToast({
                    messageTranslateKey: 'trip_detail.historic_values_offline',
                  });
                } else {
                  this.errorService.handleError(error);
                }
                return of({
                  error,
                });
              })
            )
          )
        )
      )
    );

  /* filled from the infinite scroll component */
  public serverTripsSubject = new Subject<TrackedInstanceInfo[]>();
  /** trips older than 1 month - available only online as infinite scroll paging*/
  private deepPastTrips$: Observable<ServerOrLocalTrip[]> =
    this.serverTripsSubject.pipe(
      map((trips) =>
        trips.map((trip) => ({
          ...trip,
          status: trip.validity,
        }))
      ),
      startWith([])
    );

  /**
   * Live list of recent trips - changing as user created new trips.
   * If there is no connection, they are loaded from local storage.
   */
  private recentTrips$: Observable<ServerOrLocalTrip[]> =
    this.localTripsService.localDataChanges$.pipe(
      map((storableTrips) =>
        storableTrips.map((trip) => ({
          status:
            trip.status === 'fromServer'
              ? trip.tripData.validity
              : 'NOT_SYNCHRONIZED',
          ...trip.tripData,
        }))
      )
    );

  /** Content of plugin DB locations represented as trips */
  private notSynchronizedTrips$: Observable<TrackedInstanceInfo[]> =
    this.backgroundTrackingService.notSynchronizedLocations$.pipe(
      map((notSynchronizedLocations: TripLocation[]) => {
        const tripLocations = notSynchronizedLocations.filter(
          (location) => location.transportType
        );
        const locationsAsTrips = groupByConsecutiveValues(
          tripLocations,
          'transportType'
        ).map(({ group, values }) => {
          const transportType = group;
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
            trackedInstanceId: `localId_${transportType}_${representativeLocation.date}`,
            validity: null,
          };
          return trip;
        });
        return this.sortTrips(locationsAsTrips);
      })
    );

  private fromPluginTrips$: Observable<ServerOrLocalTrip[]> = combineLatest([
    this.notSynchronizedTrips$,
    this.tripService.isInTrip$,
  ]).pipe(
    map(([notSynchronizedTrips, isInTrip]) =>
      notSynchronizedTrips.map((notSynchronizedTrip, idx) => {
        const isFirst = idx === 0;
        const isFinished = !isFirst || !isInTrip;
        const status: Status = isFinished ? 'NOT_SYNCHRONIZED' : 'ONGOING';
        return {
          ...notSynchronizedTrip,
          status,
        };
      })
    ),
    startWith([])
  );

  private trips$: Observable<ServerOrLocalTrip[]> = combineLatest([
    this.fromPluginTrips$,
    this.recentTrips$,
    this.deepPastTrips$,
  ]).pipe(
    map(([fromPluginTrips, recentTrips, deepPastTrips]) => [
      ...fromPluginTrips.map((t) => ({ ...t, source: 'fromPluginTrips' })),
      ...recentTrips.map((t) => ({ ...t, source: 'recentTrips' })),
      ...deepPastTrips.map((t) => ({ ...t, source: 'deepPastTrips' })),
    ]),
    map((trips) => this.sortTrips(trips)),
    distinctUntilChanged(isEqual)
  );

  public groupedTrips$: Observable<TripGroup[]> = combineLatest([
    this.trips$,
    this.filterOptions$,
  ]).pipe(
    map(([trips, filterOptions]) =>
      this.groupTripsAndFilter(trips, filterOptions)
    ),
    shareReplay(1)
  );

  trackGroup = trackByProperty<TripGroup>('monthDate');
  trackMultiTrip = trackByProperty<MultiTrip>('multimodalId');
  trackTrip = trackByProperty<ServerOrLocalTrip>('trackedInstanceId');

  constructor(
    private errorService: ErrorService,
    private trackApiService: TrackApiService,
    private backgroundTrackingService: BackgroundTrackingService,
    private tripService: TripService,
    private localTripsService: LocalTripsService,
    private alertService: AlertService,
    private campaignService: CampaignService,
    private activatedRoute: ActivatedRoute
  ) {}
  ngAfterViewInit() {
    const selects = document.querySelectorAll('.app-alert');
    selects.forEach((select) => {
      (select as any).interfaceOptions = {
        cssClass: 'app-alert',
      };
    });
  }

  ngOnInit() {}

  private groupTripsAndFilter(
    allTrips: ServerOrLocalTrip[],
    filterOptions: FilterOptions
  ): TripGroup[] {
    // We have to apply all filters for local trips
    const filteredTrips = allTrips
      .filter((trip) => {
        if (filterOptions.campaignId === 'NO_FILTER') {
          return true;
        }
        return (trip.campaigns ?? []).some(
          (campaign) => campaign.campaignId === filterOptions.campaignId
        );
      })
      .filter((trip) => {
        if (filterOptions.month === 'NO_FILTER') {
          return true;
        }
        return (
          filterOptions.month.from <= trip.startTime &&
          trip.startTime <= filterOptions.month.to
        );
      });

    const groupedByMultimodalId = groupByConsecutiveValues(
      filteredTrips,
      'multimodalId'
    ).map(({ group, values }) => {
      const startDate = new Date(values[0].startTime);
      const endDate = new Date(last(values).endTime);
      const isOneDayTrip =
        this.roundToDay(startDate) === this.roundToDay(endDate);
      const referenceDate = endDate;
      const monthDate = this.roundToMonth(referenceDate);

      return {
        multimodalId: group,
        trips: values,
        startDate,
        endDate,
        isOneDayTrip,
        date: referenceDate,
        monthDate,
      };
    });

    const groupedByDate = groupByConsecutiveValues(
      groupedByMultimodalId,
      'monthDate'
    ).map(({ group, values }) => ({
      monthDate: group,
      tripsInSameMonth: values,
    }));

    return groupedByDate;
  }

  private roundToDay(timestamp: number | Date): number {
    const dateCopy = new Date(timestamp);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy.getTime();
  }
  private roundToMonth(timestamp: number | Date): number {
    const dateCopy = new Date(timestamp);
    dateCopy.setDate(1);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy.getTime();
  }

  getTripsPage(
    pageRequest: PageableRequest,
    filterOptions: FilterOptions
  ): Observable<PageableResponse<TrackedInstanceInfo>> {
    const campaignId =
      filterOptions.campaignId !== 'NO_FILTER'
        ? filterOptions.campaignId
        : undefined;

    let newestDate: DateTime;
    let oldestDate: DateTime;
    if (filterOptions.month === 'NO_FILTER') {
      oldestDate = DateTime.fromMillis(0);
      newestDate = this.localTripsService.localDataFromDate;
    } else {
      oldestDate = DateTime.fromMillis(filterOptions.month.from);
      newestDate = DateTime.fromMillis(filterOptions.month.to);
    }

    return this.trackApiService.getTrackedInstanceInfoList({
      page: pageRequest.page,
      size: pageRequest.size,
      dateFrom: toServerDateTime(oldestDate), //from - older
      // TODO: check +-1 day errors!!
      dateTo: toServerDateTime(newestDate), //to - newer
      campaignId,
    });
  }

  /* from oldest to newest */
  async getListOfMonths(): Promise<Month[]> {
    const newestMonth = DateTime.now().startOf('month');
    const oldestMonth = (await this.getLastTripDate()).startOf('month');

    const months = [];
    let currentMonth = newestMonth;
    while (currentMonth >= oldestMonth) {
      months.push(currentMonth);
      currentMonth = currentMonth.minus({ month: 1 });
    }

    return months.map((dateTime) => ({
      from: dateTime.startOf('month').toMillis(),
      to: dateTime.endOf('month').toMillis(),
    }));
  }

  async getLastTripDate(): Promise<DateTime> {
    try {
      const firstTripPageInfo = await firstValueFrom(
        this.trackApiService.getTrackedInstanceInfoList({
          page: 0,
          size: 1,
        })
      );
      const numberOfTrips = firstTripPageInfo.totalElements;

      if (numberOfTrips === 0) {
        return DateTime.now();
      }

      const lastTrip = await firstValueFrom(
        this.trackApiService.getTrackedInstanceInfoList({
          page: numberOfTrips - 1,
          size: 1,
        })
      );

      if (!lastTrip?.content[0]?.endTime) {
        throw new Error('INVALID_LAST_TRIP');
      }
      return DateTime.fromMillis(lastTrip.content[0].endTime);
    } catch (e) {
      this.errorService.handleError(e, 'silent');
      return DateTime.now().minus({ years: 5 });
    }
  }

  private sortTrips(trips: TrackedInstanceInfo[]): TrackedInstanceInfo[] {
    // sort by date. First the ones with the most recent date, then the ones with the oldest date
    // aka: sort desc by timestamp
    return sortBy(
      trips,
      (trip) => -new Date(trip.endTime || trip.startTime).getTime()
    );
  }
}
type Status = TrackedInstanceInfo.ValidityEnum | 'NOT_SYNCHRONIZED' | 'ONGOING';

export interface ServerOrLocalTrip extends TrackedInstanceInfo {
  status: Status;
}

interface MultiTrip {
  startDate: Date;
  endDate: Date;
  date: Date;
  isOneDayTrip: boolean;
  multimodalId: string;
  trips: ServerOrLocalTrip[];
  monthDate: number;
}

export interface TripGroup {
  monthDate: number;
  tripsInSameMonth: MultiTrip[];
}

interface FilterOptions {
  campaignId: string | 'NO_FILTER';
  month: Month | 'NO_FILTER';
}

interface Month {
  from: number;
  to: number;
}
