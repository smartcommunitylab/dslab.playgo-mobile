import { Component, Input, OnInit } from '@angular/core';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';

@Component({
  selector: 'app-main-campaign-stat',
  templateUrl: './main-campaign-stat.component.html',
  styleUrls: ['./main-campaign-stat.component.scss'],
})
export class MainCampaignStatComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  @Input() status?: PlayerStatus;
  @Input() reportWeekStat?: CampaignPlacing;

  constructor() { }

  ngOnInit() { }
}
