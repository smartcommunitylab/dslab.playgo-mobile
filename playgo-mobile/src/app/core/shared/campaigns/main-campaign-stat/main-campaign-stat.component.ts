import { Component, Input, OnInit } from '@angular/core';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-main-campaign-stat',
  templateUrl: './main-campaign-stat.component.html',
  styleUrls: ['./main-campaign-stat.component.scss'],
})
export class MainCampaignStatComponent implements OnInit {

  @Input() campaignContainer: PlayerCampaign;
  @Input() status?: PlayerGameStatus = undefined;
  @Input() record?: TransportStat = undefined;
  @Input() reportWeekStat?: CampaignPlacing;
  @Input() reportMonthStat?: CampaignPlacing;
  @Input() reportTotalStat?: CampaignPlacing;
  @Input() limitMonthMax?: any;
  @Input() limitMonthValue?: any;
  @Input() limitDayMax?: any;
  @Input() limitDayValue?: any;
  @Input() showRanking?: boolean = true;
  @Input() showGameStatus?: boolean = false;
  @Input() unit?: string = '';
  constructor(public campaignService: CampaignService) { }
  getValueByUnit(value: number, unit: string): number {
    if ('Km' === unit) {
      return value / 1000;
    }
    return value;
  }
  ngOnInit() {
    // console.log(this.status);
  }
}
