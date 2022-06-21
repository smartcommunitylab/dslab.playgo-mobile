import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { Player } from 'src/app/core/api/generated/model/player';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-home-campaign-company',
  templateUrl: './home-campaign-company.component.html',
  styleUrls: ['./home-campaign-company.component.scss'],
})
export class HomeCampaignCompanyComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;
  subStat: Subscription;
  profile: Player;
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
      this.profile = profile;
      this.reportService
        .getCo2Stats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'),
          DateTime.utc().toFormat('yyyy-MM-dd')
        )
        .then((stats) => {
          this.reportWeekStat = stats;
        });
      this.reportService
        .getCo2Stats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId
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
