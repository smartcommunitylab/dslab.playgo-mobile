import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-my-campaign',
  templateUrl: './my-campaign.component.html',
  styleUrls: ['./my-campaign.component.scss'],
})
export class MyCampaignComponent implements OnInit, OnDestroy {
  numberPage?: number;
  myCampaigns?: PlayerCampaign[];
  sub: Subscription;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.sub = this.campaignService.myCampaigns$.subscribe((campaigns) => {
      this.myCampaigns = campaigns;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  joinCampaign(id: string) {
    console.log('joining the campaign', id);
  }
}
