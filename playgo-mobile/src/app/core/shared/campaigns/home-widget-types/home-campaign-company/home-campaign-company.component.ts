import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { Player } from 'src/app/core/api/generated/model/player';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ErrorService } from '../../../services/error.service';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';
import { toServerDateOnly } from '../../../time.utils';
import { isOfflineError } from '../../../utils';

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
  reportDayStat: CampaignPlacing;
  reportMonthStat: CampaignPlacing;
  reportTotalStat: CampaignPlacing;
  imagePath: string;
  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.imagePath = this.campaignContainer.campaign.logo.url
      ? this.campaignContainer.campaign.logo.url
      : 'data:image/jpg;base64,' + this.campaignContainer.campaign.logo.image;
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
      this.reportService
        .getBikeStats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          toServerDateOnly(DateTime.utc().minus({ day: 1 })),
          toServerDateOnly(DateTime.utc())
        )
        .then((stats) => {
          this.reportDayStat = stats;
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.reportDayStat = null;
          } else {
            this.reportDayStat = null;
            this.errorService.handleError(error);
          }
        });
      this.reportService
        .getBikeStats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          toServerDateOnly(DateTime.utc().minus({ month: 1 })),
          toServerDateOnly(DateTime.utc())
        )
        .then((stats) => {
          this.reportMonthStat = stats;
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.reportMonthStat = null;
          } else {
            this.reportMonthStat = null;
            this.errorService.handleError(error);
          }
        });
      this.reportService
        .getBikeStats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId
        )
        .then((stats) => {
          this.reportTotalStat = stats;
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.reportTotalStat = null;
          } else {
            this.reportTotalStat = null;
            this.errorService.handleError(error);
          }
        });
    });
  }
  goToChallenge(event: Event) {
    if (event && event.stopPropagation) {
      console.log('goToChallenge - stopPropagation');
      event.stopPropagation();
    }
    console.log('goToChallenge');
  }
  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
}
