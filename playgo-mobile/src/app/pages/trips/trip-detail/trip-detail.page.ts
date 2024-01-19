import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import { CampaignTripInfo } from 'src/app/core/api/generated/model/campaignTripInfo';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { TrackApiService } from 'src/app/core/shared/tracking/track-api.service';
import {
  getTransportTypeIcon,
  getTransportTypeLabel,
} from 'src/app/core/shared/tracking/trip.model';
import { AlertService } from 'src/app/core/shared/services/alert.service';
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
  subCampaign: Subscription;
  campaignAvailability: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private errorService: ErrorService,
    private trackApiService: TrackApiService,
    public campaignService: CampaignService,
    private alertService: AlertService
  ) { }

  async ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    this.subCampaign = this.campaignService.myCampaigns$.subscribe(
      (campaigns) => {
        this.campaignAvailability = campaigns.map(
          (campaignContainer) =>
            campaignContainer.campaign.campaignId
        );
      }
    );
    try {
      this.tripDetail = await this.getTripDetail(tripId);
      this.showMap = Boolean(this.tripDetail.polyline);
      this.campaigns = this.tripDetail.campaigns.filter(campaign => campaign.valid);
      this.durationLabel = formatDurationToHoursAndMinutes(
        this.tripDetail.endTime - this.tripDetail.startTime
      );
    } catch (e) {
      this.errorService.handleError(e);
    }

  }
  openCampaign(campaign: CampaignTripInfo) {
    //check if campaign is valid
    if (!this.campaignAvailability.includes(campaign.campaignId)) {
      return this.alertService.showToast({ messageTranslateKey: 'campaigns.removed' });
    }
    this.router.navigateByUrl(
      '/pages/tabs/trips/campaign-detail/' + campaign.campaignId
    );
  }
  async getTripDetail(id: string): Promise<TrackedInstanceInfo> {
    return await this.trackApiService.getTrackedInstanceInfoDetail(id);
  }
  getLabelObs(campaign: CampaignTripInfo): Observable<string> {
    return this.campaignService.myCampaigns$.pipe(
      map(
        (campaigns) =>
          campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === campaign.campaignId
          )?.campaign?.specificData?.virtualScore?.label
      )
    );
  }
}
