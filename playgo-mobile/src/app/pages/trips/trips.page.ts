import { Component, OnInit, TrackByFunction } from '@angular/core';
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
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
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
  tapLog,
  trackByProperty,
} from 'src/app/core/shared/utils';
import {
  toServerDateOnly,
  toServerDateTime,
} from 'src/app/core/shared/time.utils';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import {
  BackgroundTrackingService,
  TripLocation,
} from 'src/app/core/shared/tracking/background-tracking.service';
import { TripService } from 'src/app/core/shared/tracking/trip.service';
import { LocalTripsService } from 'src/app/core/shared/tracking/local-trips.service';
import { DateTime } from 'luxon';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import {
  LanguageMap,
  StringLanguageMap,
} from 'src/app/core/shared/pipes/languageMap.pipe';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit {
  transportTypeLabels = transportTypeLabels;
  scrollRequestSubject = new Subject<PageableRequest>();

  noMonthOrYearFormat: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  tripsResponse$: Observable<PageableResponse<TrackedInstanceInfo>> =
    this.scrollRequestSubject.pipe(
      startWith({
        page: 0,
        size: 5,
      }),
      concatMap((scrollRequest) =>
        this.getTripsPage(scrollRequest).pipe(
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

  public myCampaigns$: Observable<{ name?: StringLanguageMap; id: string }[]> =
    this.campaignService.myCampaigns$.pipe(
      map((campaigns) => [
        {
          id: 'NO_FILTER',
        },
        ...campaigns.map((campaign) => ({
          name: campaign.campaign.name as StringLanguageMap,
          id: campaign.campaign.campaignId,
        })),
      ])
    );
  public campaignFilterSubject = new BehaviorSubject<string>('NO_FILTER');
  private campaignFilter$: Observable<string> =
    this.campaignFilterSubject.asObservable();

  public groupedTrips$: Observable<TripGroup[]> = combineLatest([
    this.trips$,
    this.campaignFilter$,
  ]).pipe(
    map(([trips, campaignId]) => this.groupTripsAndFilter(trips, campaignId)),
    shareReplay(1)
  );

  trackGroup = trackByProperty<TripGroup>('monthDate');
  trackMultiTrip = trackByProperty<MultiTrip>('multimodalId');
  trackTrip = trackByProperty<ServerOrLocalTrip>('trackedInstanceId');

  constructor(
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService,
    private backgroundTrackingService: BackgroundTrackingService,
    private tripService: TripService,
    private localTripsService: LocalTripsService,
    private alertService: AlertService,
    private campaignService: CampaignService
  ) {}

  ngOnInit() {}

  private groupTripsAndFilter(
    allTrips: ServerOrLocalTrip[],
    campaignId: string
  ): TripGroup[] {
    const groupedByMultimodalId = groupByConsecutiveValues(
      allTrips,
      'multimodalId'
    )
      .map(({ group, values }) => {
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
      })
      .filter((eachMultiTrip) => {
        if (campaignId === 'NO_FILTER') {
          return true;
        }
        return (eachMultiTrip.trips || []).some((eacTrip) =>
          (eacTrip.campaigns || []).some(
            (campaign) => campaign.campaignId === campaignId
          )
        );
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
    pageRequest: PageableRequest
  ): Observable<PageableResponse<TrackedInstanceInfo>> {
    return this.trackControllerService.getTrackedInstanceInfoListUsingGET({
      page: pageRequest.page,
      size: pageRequest.size,
      dateFrom: toServerDateTime(DateTime.fromMillis(0)), //from - older
      // TODO: check +-1 day errors!!
      dateTo: toServerDateTime(this.localTripsService.localDataFromDate), //to - newer
    });
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
