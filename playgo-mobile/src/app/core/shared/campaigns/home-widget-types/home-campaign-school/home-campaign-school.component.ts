import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerStatus } from 'src/app/core/api/generated/model/playerStatus';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-home-campaign-school',
  templateUrl: './home-campaign-school.component.html',
  styleUrls: ['./home-campaign-school.component.scss'],
})
export class HomeCampaignSchoolComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;
  subStat: Subscription;
  campaignStatus: PlayerStatus;
  reportWeekStat: CampaignPlacing;
  reportTotalStat: CampaignPlacing;
  imagePath: string;
  language: string;
  constructor(
    private userService: UserService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.language = this.userService.getLanguage();
    this.imagePath = this.campaignContainer.campaign.logo.url
      ? this.campaignContainer.campaign.logo.url
      : 'data:image/jpg;base64,' + this.campaignContainer.campaign.logo.image;
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      // this.status = status;
      this.reportService
        .getGameStatus(this.campaignContainer.campaign.campaignId)
        .then((campaignStatus) => {
          this.campaignStatus = campaignStatus;
        });
      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId,
          DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'),
          DateTime.utc().toFormat('yyyy-MM-dd')
        )
        .then((stats) => {
          this.reportWeekStat = stats;
        });
      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId
        )
        .then((stats) => {
          this.reportTotalStat = stats;
        });
    });
  }

  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
}
