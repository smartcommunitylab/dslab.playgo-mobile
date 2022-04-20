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

@Component({
  selector: 'app-trips',
  templateUrl: './trips.page.html',
  styleUrls: ['./trips.page.scss'],
})
export class TripsPage implements OnInit {
  transportTypeLabels = transportTypeLabels;

  scrollRequest = new Subject<PageableRequest>();

  tripsResponse$: Observable<PageableResponse<TripInfo>> =
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
    private errorService: ErrorService
  ) {}
  ngOnInit() {}

  // TODO: memoize
  public groupTrips(allTrips: TripInfo[]): TripGroup[] {
    const groupedByMultimodalId = groupByConsecutiveValues(
      allTrips,
      'multimodalId'
    ).map(({ group, values }) => {
      const startDate = this.roundToDay(values[0].startTime);
      const endDate = this.roundToDay(last(values).endTime);
      const isOneDayTrip = startDate === endDate;
      return {
        multimodalId: group,
        trips: values,
        startDate,
        endDate,
        isOneDayTrip,
        date: endDate, // endDate is used for grouping
      };
    });

    const groupedByDate = groupByConsecutiveValues(
      groupedByMultimodalId,
      'date'
    ).map(({ group, values }) => ({
      date: group,
      tripsInSameDate: values,
    }));

    return groupedByDate;
  }

  private roundToDay(timestamp: number): number {
    const dateCopy = new Date(timestamp);
    dateCopy.setHours(0, 0, 0, 0);
    return dateCopy.getTime();
  }

  // TODO: move to service..
  async getTripsPage(
    pageRequest: PageableRequest
  ): Promise<PageableResponse<TripInfo>> {
    return await this.authHttpService.request(
      'GET',
      '/track/player',
      pageRequest
      // { page: 0, size: 3 }
    );
  }
}

export interface TripGroup {
  date: number;
  tripsInSameDate: {
    startDate: number;
    endDate: number;
    isOneDayTrip: boolean;
    multimodalId: string;
    trips: TripInfo[];
    date: number;
  }[];
}

export interface TripInfo {
  trackedInstanceId: string;
  multimodalId: string;
  startTime: number;
  endTime: number;
  modeType: TransportType;
  distance: number;
  validity: 'VALID' | 'INVALID';
  campaigns: TripCampaign[];
  polyline: string;
}
export interface TripCampaign {
  campaignId: string;
  campaignName: string;
  score: number;
  valid: boolean;
}
