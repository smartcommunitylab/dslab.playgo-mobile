import { Component, Input, OnInit } from '@angular/core';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { CampaignService } from '../../services/campaign.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-main-campaign-stat',
  templateUrl: './main-campaign-stat.component.html',
  styleUrls: ['./main-campaign-stat.component.scss'],
})
export class MainCampaignStatComponent implements OnInit {
  month: number;
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
  @Input() lastPaymentStat?: any;
  @Input() lastPaymentDate?: any;
  @Input() lastPaymentDateTo?: any;
  constructor(public campaignService: CampaignService) { }
  getValueByUnit(value: number, unit: string, virtualSore: boolean): number {
    if ('Km' === unit && !virtualSore) {
      return value / 1000;
    }
    return value;
  }
  ngOnInit() {
    this.month = DateTime.local().toMillis();
    console.log(this.month);

  }
  getTitle(title: string) {
    if (!title) {
      return '';
    }
    return title[0].toUpperCase() + title.substr(1).toLowerCase();
  }
}
