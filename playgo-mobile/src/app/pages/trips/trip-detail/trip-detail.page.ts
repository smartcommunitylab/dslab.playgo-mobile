import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { flatMap } from 'lodash-es';
import { Duration } from 'luxon';
import { TrackControllerService } from 'src/app/core/api/generated/controllers/trackController.service';
import { CampaignTripInfo } from 'src/app/core/api/generated/model/campaignTripInfo';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import {
  transportTypeIcons,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { formatDurationToHoursAndMinutes } from 'src/app/core/shared/utils';

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
  language: string;

  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private trackControllerService: TrackControllerService,
    public campaignService: CampaignService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.language = this.userService.getLanguage();
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      try {
        this.tripDetail = await this.getTripDetail(tripId);
        this.showMap = Boolean(this.tripDetail.polyline);
        this.campaigns = this.tripDetail.campaigns;
        this.durationLabel = formatDurationToHoursAndMinutes(
          this.tripDetail.endTime - this.tripDetail.startTime
        );
      } catch (e) {
        // TODO: incorrect id handling
        this.errorService.showAlert(e);
      }
    }
  }

  async getTripDetail(id: string): Promise<TrackedInstanceInfo> {
    return await this.trackControllerService
      .getTrackedInstanceInfoUsingGET({ trackedInstanceId: id })
      .toPromise();
  }
}
