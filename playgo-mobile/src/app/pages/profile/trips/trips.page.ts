import { Component, OnInit } from '@angular/core';
import { first, isEqual, last } from 'lodash-es';
import { combineLatest, Observable, Subject, throwError } from 'rxjs';
import {
  catchError,
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
import { groupByConsecutiveValues, tapLog } from 'src/app/core/shared/utils';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import {
  BackgroundTrackingService,
  TripLocation,
} from 'src/app/core/shared/tracking/background-tracking.service';
import { TripService } from 'src/app/core/shared/tracking/trip.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit {
  transportTypeLabels = transportTypeLabels;

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

  public notSynchronizedTripsWithStatus$: Observable<
    TrackedOrLocalInstanceInfo[]
  > = combineLatest([
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
    distinctUntilChanged(isEqual),
    shareReplay(1)
  );

  scrollRequest = new Subject<PageableRequest>();

  tripsResponse$: Observable<PageableResponse<TrackedInstanceInfo>> =
    this.scrollRequest.pipe(
      startWith({
        page: 0,
        size: 5,
      }),
      switchMap((scrollRequest) => this.getTripsPage(scrollRequest)),
      catchError((error) => {
        this.errorService.showAlert(error);
        return throwError(error);
      })
    );

  constructor(
    private authHttpService: AuthHttpService,
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService,
    private backgroundTrackingService: BackgroundTrackingService,
    private tripService: TripService
  ) {}
  ngOnInit() {}

  // TODO: memoize
  public groupTrips(allTrips: TrackedOrLocalInstanceInfo[]): TripGroup[] {
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

  // TODO: move to service..
  async getTripsPage(
    pageRequest: PageableRequest
  ): Promise<PageableResponse<TrackedInstanceInfo>> {
    return await this.trackControllerService
      .getTrackedInstanceInfoListUsingGET(pageRequest.page, pageRequest.size)
      .toPromise();
  }
}
export interface TrackedOrLocalInstanceInfo extends TrackedInstanceInfo {
  isLocal: boolean;
  isFinished: boolean;
}

export interface TripGroup {
  monthDate: number;
  tripsInSameMonth: {
    startDate: Date;
    endDate: Date;
    date: Date;
    isOneDayTrip: boolean;
    multimodalId: string;
    trips: TrackedOrLocalInstanceInfo[];
    monthDate: number;
  }[];
}
