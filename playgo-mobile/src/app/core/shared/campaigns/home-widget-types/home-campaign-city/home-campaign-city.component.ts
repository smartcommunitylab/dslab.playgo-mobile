import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DateTime } from 'luxon';
import { toServerDateOnly } from '../../../time.utils';
import { ErrorService } from '../../../services/error.service';
import { isOfflineError } from '../../../utils';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { Notification } from '../../../../api/generated/model/notification';
@Component({
  selector: 'app-home-campaign-city',
  templateUrl: './home-campaign-city.component.html',
  styleUrls: ['./home-campaign-city.component.scss'],
})
export class HomeCampaignCityComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;

  subStat: Subscription;
  campaignStatus: PlayerGameStatus;
  reportWeekStat: CampaignPlacing;
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
      // this.status = status;
      this.reportService
        .getGameStatus(this.campaignContainer.campaign.campaignId)
        .then((campaignStatus) => {
          this.campaignStatus = campaignStatus;
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.campaignStatus = null;
          } else {
            this.campaignStatus = null;
            this.errorService.handleError(error);
          }
        });

      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId,
          toServerDateOnly(DateTime.utc().minus({ week: 1 })),
          toServerDateOnly(DateTime.utc())
        )
        .then((stats) => {
          this.reportWeekStat = stats;
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.reportWeekStat = null;
          } else {
            this.reportWeekStat = null;
            this.errorService.handleError(error);
          }
        });

      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId
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
