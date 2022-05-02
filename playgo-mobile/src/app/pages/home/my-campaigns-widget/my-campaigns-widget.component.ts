import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignClass } from 'src/app/core/shared/campaigns/classes/campaign-class';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-my-campaigns-widget',
  templateUrl: './my-campaigns-widget.component.html',
  styleUrls: ['./my-campaigns-widget.component.scss'],
})
export class MyCampaignsWidgetComponent implements OnInit, OnDestroy {
  myCampaigns: PlayerCampaign[];
  sub: Subscription;
  constructor(private campaignService: CampaignService) { }

  ngOnInit() {
    this.sub = this.campaignService.myCampaigns$.subscribe((campaigns) => {
      this.myCampaigns = campaigns;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
