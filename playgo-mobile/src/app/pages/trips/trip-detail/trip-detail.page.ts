import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { flatMap } from 'lodash-es';
import { Duration } from 'luxon';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import { CampaignTripInfo } from 'src/app/core/api/generated/model/campaignTripInfo';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { AuthHttpService } from 'src/app/core/auth/auth-http.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
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
  tripDetail: TrackedInstanceInfo = null;
  campaigns: CampaignTripInfo[];
  showMap: boolean;
  durationLabel: string;
  transportTypeIcons = transportTypeIcons;
  transportTypeLabels = transportTypeLabels;

  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService,
    public campaignService: CampaignService
  ) {}

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      try {
        this.tripDetail = await this.getTripDetail(tripId);
        this.showMap = Boolean(this.tripDetail.polyline);
        this.campaigns = this.tripDetail.campaigns;
        this.durationLabel = this.formatDuration(
          this.tripDetail.endTime,
          this.tripDetail.startTime
        );
      } catch (e) {
        // TODO: incorrect id handling
        this.errorService.showAlert(e);
      }
    }
  }

  formatDuration(endTime: number, startTime: number) {
    const duration = Duration.fromMillis(endTime - startTime).shiftTo(
      'hours',
      'minutes'
    );
    const hours = duration.hours;
    const minutes = Math.round(duration.minutes);
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  }
  async getTripDetail(id: string): Promise<TrackedInstanceInfo> {
    return await this.trackControllerService
      .getTrackedInstanceInfoUsingGET({ trackedInstanceId: id })
      .toPromise();
  }
}
