import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DateTime } from 'luxon';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Player } from 'src/app/core/api/generated/model/player';

@Component({
  selector: 'app-home-campaign-personal',
  templateUrl: './home-campaign-personal.component.html',
  styleUrls: ['./home-campaign-personal.component.scss'],
})
export class HomeCampaignPersonalComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;

  subStat: Subscription;
  profile: Player;
  reportWeekStat: CampaignPlacing;
  reportTotalStat: CampaignPlacing;
  imagePath: string;
  constructor(
    private userService: UserService,
    private reportService: ReportService
  ) { }

  ngOnInit() {
    this.imagePath = this.campaignContainer.campaign.logo.url ? this.campaignContainer.campaign.logo.url :
      'data:image/jpg;base64,' + this.campaignContainer.campaign.logo.image;
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
