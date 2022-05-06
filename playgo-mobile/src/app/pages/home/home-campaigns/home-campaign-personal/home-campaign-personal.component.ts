import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DateTime } from 'luxon';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-home-campaign-personal',
  templateUrl: './home-campaign-personal.component.html',
  styleUrls: ['./home-campaign-personal.component.scss'],
})
export class HomeCampaignPersonalComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  subStat: Subscription;
  status: PlayerStatus;
  reportWeekStat: CampaignPlacing;
  constructor(private userService: UserService, private reportService: ReportService) { }

  ngOnInit() {
    this.subStat = this.userService.userStatus$.subscribe((status) => {
      this.status = status;
      this.reportService.getCo2Stats(
        this.campaignContainer.campaign.campaignId,
        this.status.playerId,
        DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'),
        DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd')).then((stats) => {
          this.reportWeekStat = stats;
        });
    });
  }

  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
}
