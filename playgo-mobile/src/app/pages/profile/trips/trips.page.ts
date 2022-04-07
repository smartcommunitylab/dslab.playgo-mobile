import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { sample, startsWith, times } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
import {
  PageableRequest,
  PageableResponse,
} from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { transportTypeLabels } from 'src/app/core/shared/tracking/trip.model';
import { time } from 'src/app/core/shared/utils';

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
      startWith(null as any),
      switchMap((scrollRequest) => this.getTripsPage(scrollRequest))
    );

  constructor(
    private authHttpService: AuthHttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {}

  openTripDetail(trackedInstanceId: string) {
    this.router.navigate(['../trip-detail', trackedInstanceId], {
      relativeTo: this.route,
    });
  }

  // TODO: move to service..
  async getTripsPage(
    pageRequest: PageableRequest
  ): Promise<PageableResponse<TripInfo>> {
    return await this.authHttpService.request(
      'GET',
      '/track/player',
      pageRequest
    );
    // await time(1000);
    // return {
    //   content: times(100, (n) => ({
    //     start: n,
    //     end: n,
    //     valid: sample([true, false]),
    //   })),
    // } as any;
  }
}

interface TripInfo {
  trackedInstanceId: string;
  multimodalId: string;
  startTime: number;
  endTime: number;
  modeType: string;
  distance: number;
  validity: 'VALID' | 'INVALID';
  campaigns: [];
  polyline: string;
}
