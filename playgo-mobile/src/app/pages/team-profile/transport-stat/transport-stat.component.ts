import { Component, Input, OnInit } from '@angular/core';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { switchMap, shareReplay } from 'rxjs';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { DateTime } from 'luxon';
@Component({
  selector: 'app-transport-stat',
  templateUrl: './transport-stat.component.html',
  styleUrls: ['./transport-stat.component.scss'],
})
export class TransportStatComponent implements OnInit {
  @Input() playerId: string;
  personalCampaign$ = this.campaignService.getPersonalCampaign();
  personalStat$ = this.personalCampaign$.pipe(
    switchMap((personalCampaign) =>
      this.reportController.getPlayerTransportStatsGroupByMeanUsingGET({
        campaignId: personalCampaign?.campaign?.campaignId,
        playerId: this.playerId,
        metric: 'km',
        dateFrom: toServerDateOnly(DateTime.utc().minus({ month: 1 })),
        dateTo: toServerDateOnly(DateTime.utc()),
      })
    ),
    shareReplay(1)
  );
  constructor(
    private campaignService: CampaignService,
    private reportController: ReportControllerService
  ) {}

  ngOnInit() {}
}
