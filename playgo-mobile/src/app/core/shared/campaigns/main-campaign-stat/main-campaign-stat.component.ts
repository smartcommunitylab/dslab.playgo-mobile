import { Component, Input, OnInit } from '@angular/core';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-main-campaign-stat',
  templateUrl: './main-campaign-stat.component.html',
  styleUrls: ['./main-campaign-stat.component.scss'],
})
export class MainCampaignStatComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  @Input() status?: any = undefined;
  @Input() record?: TransportStat = undefined;
  @Input() reportWeekStat?: CampaignPlacing;
  @Input() reportTotalStat?: CampaignPlacing;

  constructor(public campaignService: CampaignService) {}

  ngOnInit() {
    console.log(this.status);
  }
}
