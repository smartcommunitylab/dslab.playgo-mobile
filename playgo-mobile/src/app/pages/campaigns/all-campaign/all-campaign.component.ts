import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-all-campaign',
  templateUrl: './all-campaign.component.html',
  styleUrls: ['./all-campaign.component.scss'],
})
export class AllCampaignComponent implements OnInit, OnDestroy {
  numberPage = 0;
  allCampaigns?: Campaign[];
  sub: any;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.sub = combineLatest([
      this.campaignService.myCampaigns$,
      this.campaignService.allCampaigns$,
    ]).subscribe(([my, all]) => {
      this.allCampaigns = all.filter(
        (allCampaign) =>
          !my.find(
            (myCampaign) =>
              allCampaign.campaignId === myCampaign.campaign.campaignId
          )
      );
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  joinCampaign(id: string) {
    console.log('joining the campaign', id);
  }
}
