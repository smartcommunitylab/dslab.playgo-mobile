import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-widget-campaign',
  templateUrl: './app-widget-campaign.component.html',
  styleUrls: ['./app-widget-campaign.component.scss'],
})
export class WidgetComponent implements OnInit, OnDestroy {
  @Input() campaign: PlayerCampaign;
  @Input() header?: boolean = false;
  constructor(private router: Router) {}

  ngOnInit() {}

  ngOnDestroy() {}
  detailCampaign(campaign: PlayerCampaign) {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/details/' + campaign.campaign.campaignId
    );
  }
}
