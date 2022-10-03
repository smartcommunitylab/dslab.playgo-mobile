import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignTripInfo } from 'src/app/core/api/generated/model/campaignTripInfo';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { TrackApiService } from 'src/app/core/shared/tracking/track-api.service';
import {
  getTransportTypeIcon,
  getTransportTypeLabel,
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
  getTransportTypeIcon = getTransportTypeIcon;
  getTransportTypeLabel = getTransportTypeLabel;

  constructor(
    private route: ActivatedRoute,
    private errorService: ErrorService,
    private trackApiService: TrackApiService,
    public campaignService: CampaignService
  ) {}

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');

    try {
      this.tripDetail = await this.getTripDetail(tripId);
      this.showMap = Boolean(this.tripDetail.polyline);
      this.campaigns = this.tripDetail.campaigns;
      this.durationLabel = formatDurationToHoursAndMinutes(
        this.tripDetail.endTime - this.tripDetail.startTime
      );
    } catch (e) {
      this.errorService.handleError(e);
    }
  }

  async getTripDetail(id: string): Promise<TrackedInstanceInfo> {
    return await this.trackApiService.getTrackedInstanceInfoDetail(id);
  }
}
