import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { flatMap } from 'lodash-es';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import { CampaignTripInfo } from 'src/app/core/api/generated/model/campaignTripInfo';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import {
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
})
export class TripDetailPage implements OnInit {
  tripDetails: TrackedInstanceInfo[] = null;
  campaigns: CampaignTripInfo[];
  showMap: boolean;
  transportTypeIcons = transportTypeIcons;
  transportTypeLabels = transportTypeLabels;

  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService
  ) {}

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      try {
        const singleTripDetail = await this.getTripDetail(tripId);
        this.tripDetails = [singleTripDetail];
        this.showMap = this.tripDetails.some((trip) => trip.polyline);
        this.campaigns = flatMap(
          this.tripDetails,
          (trip: TrackedInstanceInfo) => trip.campaigns
        );
      } catch (e) {
        // TODO: incorrect id handling
        this.errorService.showAlert(e);
      }
    }
  }
  async getTripDetail(id: string): Promise<TrackedInstanceInfo> {
    return await this.trackControllerService
      .getTrackedInstanceInfoUsingGET(id)
      .toPromise();
  }
}
