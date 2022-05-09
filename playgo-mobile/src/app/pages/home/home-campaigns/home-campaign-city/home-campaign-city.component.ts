import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DateTime } from 'luxon';
@Component({
  selector: 'app-home-campaign-city',
  templateUrl: './home-campaign-city.component.html',
  styleUrls: ['./home-campaign-city.component.scss'],
})
export class HomeCampaignCityComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  subStat: Subscription;
  campaignStatus: PlayerStatus;
  reportWeekStat: CampaignPlacing;
  constructor(
    private userService: UserService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.subStat = this.userService.userStatus$.subscribe((status) => {
      // this.status = status;
      this.reportService
        .getGameStatus(this.campaignContainer.campaign.campaignId)
        .then((campaignStatus) => {
          this.campaignStatus = campaignStatus;
        });
      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          status.playerId,
          DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'),
          DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd')
        )
        .then((stats) => {
          this.reportWeekStat = stats;
        });
    });
  }

  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
}
