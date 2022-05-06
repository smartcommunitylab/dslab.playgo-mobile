import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-home-campaign-company',
  templateUrl: './home-campaign-company.component.html',
  styleUrls: ['./home-campaign-company.component.scss'],
})
export class HomeCampaignCompanyComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }
}
