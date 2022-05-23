import { Component, OnInit, TrackByFunction } from '@angular/core';
import { first, isEqual, last } from 'lodash-es';
import { combineLatest, Observable, Subject, throwError } from 'rxjs';
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
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
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
  tapLog,
  toServerDateOnly,
  toServerDateTime,
} from 'src/app/core/shared/utils';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import {
  BackgroundTrackingService,
  TripLocation,
} from 'src/app/core/shared/tracking/background-tracking.service';
import { TripService } from 'src/app/core/shared/tracking/trip.service';
import { LocalTripsService } from 'src/app/core/shared/tracking/local-trips.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit {
  transportTypeLabels = transportTypeLabels;
  scrollRequestSubject = new Subject<PageableRequest>();

  tripsResponse$: Observable<PageableResponse<TrackedInstanceInfo>> =
    this.scrollRequestSubject.pipe(
      startWith({
        page: 0,
        size: 5,
      }),
      concatMap((scrollRequest) => this.getTripsPage(scrollRequest)),
      catchError((error) => {
        this.errorService.showAlert(error);
        return throwError(error);
      })
    );

  /* filled from the infinite scroll component */
  public serverTripsSubject = new Subject<TrackedInstanceInfo[]>();
  /** trips older than 1 month - available only online as infinite scroll paging*/
  private deepPastTrips$: Observable<ServerOrLocalTrip[]> =
    this.serverTripsSubject.pipe(
      map((trips) =>
        trips.map((trip) => ({
          ...trip,
          isLocal: false,
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
          isFinished: true,
          isLocal: trip.status !== 'fromServer',
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
        return groupByConsecutiveValues(tripLocations, 'transportType').map(
          ({ group, values }) => {
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
          }
        );
      })
    );

  private fromPluginTrips$: Observable<ServerOrLocalTrip[]> = combineLatest([
    this.notSynchronizedTrips$,
    this.tripService.isInTrip$,
  ]).pipe(
    map(([notSynchronizedTrips, isInTrip]) =>
      notSynchronizedTrips.map((notSynchronizedTrip, idx) => {
        const isLast = idx === notSynchronizedTrips.length - 1;
        return {
          ...notSynchronizedTrip,
          isFinished: !isLast || !isInTrip,
          isLocal: true,
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
    distinctUntilChanged(isEqual)
  );

  public groupedTrips$: Observable<TripGroup[]> = this.trips$.pipe(
    map((trips) => this.groupTrips(trips)),
    shareReplay(1)
  );

  constructor(
    private authHttpService: AuthHttpService,
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService,
    private backgroundTrackingService: BackgroundTrackingService,
    private tripService: TripService,
    private localTripsService: LocalTripsService
  ) {}

  trackGroup: TrackByFunction<TripGroup> = (index: number, group: TripGroup) =>
    group.monthDate;

  trackMultiTrip: TrackByFunction<MultiTrip> = (
    index: number,
    multiTrip: MultiTrip
  ) => multiTrip.multimodalId;

  trackTrip: TrackByFunction<ServerOrLocalTrip> = (
    index: number,
    trip: ServerOrLocalTrip
  ) => trip.trackedInstanceId;

  ngOnInit() {}

  private groupTrips(allTrips: ServerOrLocalTrip[]): TripGroup[] {
    const groupedByMultimodalId = groupByConsecutiveValues(
      allTrips,
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
    pageRequest: PageableRequest
  ): Observable<PageableResponse<TrackedInstanceInfo>> {
    return this.trackControllerService.getTrackedInstanceInfoListUsingGET(
      pageRequest.page,
      pageRequest.size,
      toServerDateTime(DateTime.fromMillis(0)) as unknown as Date, //from - older
      null, //sort
      // TODO: check +-1 day errors!!
      toServerDateTime(
        this.localTripsService.localDataFromDate
      ) as unknown as Date //to - newer
    );
  }
}
export interface ServerOrLocalTrip extends TrackedInstanceInfo {
  isLocal: boolean;
  isFinished?: boolean;
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
