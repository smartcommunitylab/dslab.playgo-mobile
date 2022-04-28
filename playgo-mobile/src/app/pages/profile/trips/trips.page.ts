import { Component, OnInit } from '@angular/core';
import { last } from 'lodash-es';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, startWith, switchMap } from 'rxjs/operators';
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
import { groupByConsecutiveValues } from 'src/app/core/shared/utils';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit {
  transportTypeLabels = transportTypeLabels;

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
    private trackControllerService: TrackControllerService
  ) {}
  ngOnInit() {}

  // TODO: memoize
  public groupTrips(allTrips: TrackedInstanceInfo[]): TripGroup[] {
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

export interface TripGroup {
  monthDate: number;
  tripsInSameMonth: {
    startDate: Date;
    endDate: Date;
    isOneDayTrip: boolean;
    multimodalId: string;
    trips: TrackedInstanceInfo[];
    monthDate: number;
  }[];
}
