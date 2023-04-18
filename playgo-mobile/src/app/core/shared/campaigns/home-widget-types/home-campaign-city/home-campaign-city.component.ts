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
import { ChallengeService } from '../../../services/challenge.service';
import { Challenge } from 'src/app/pages/challenges/challenges.page';
import { getCampaignImage } from '../../campaignUtils';
@Component({
  selector: 'app-home-campaign-city',
  templateUrl: './home-campaign-city.component.html',
  styleUrls: ['./home-campaign-city.component.scss'],
})
export class HomeCampaignCityComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;

  public activeUncompleteChallenges$: Observable<Challenge[]>;
  // activeUncompleteChallenges: Challenge[] = [];
  subChallActive: Subscription;
  gameStatus: Subscription;
  subStat: Subscription;
  campaignStatus: PlayerGameStatus = null;
  reportWeekStat: CampaignPlacing;
  reportTotalStat: CampaignPlacing;
  imagePath: string;
  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService,
    private challengeService: ChallengeService
  ) { }

  ngOnInit() {
    this.activeUncompleteChallenges$ =
      this.challengeService.getActiveUncompletedChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.imagePath = getCampaignImage(this.campaignContainer);
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      // this.subChallActive = this.activeUncompleteChallenges$.subscribe(
      //   (challenges) => {
      //     this.activeUncompleteChallenges = challenges;
      //   }
      // );
      this.gameStatus = this.reportService
        .getGameStatus(this.campaignContainer.campaign.campaignId)
        .subscribe(
          (campaignStatus) => {
            this.campaignStatus = campaignStatus;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.campaignStatus = undefined;
            } else {
              this.campaignStatus = undefined;
              this.errorService.handleError(error);
            }
          }
        );

      // First release: only global report, for the we can add global
      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId,
          toServerDateOnly(DateTime.utc().startOf('week')),
          toServerDateOnly(DateTime.utc())
        )
        .subscribe(
          (stats) => {
            this.reportWeekStat = stats;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.reportWeekStat = null;
            } else {
              this.reportWeekStat = null;
              this.errorService.handleError(error);
            }
          }
        );

      this.reportService
        .getGameStats(
          this.campaignContainer.campaign.campaignId,
          profile.playerId
        )
        .subscribe(
          (stats) => {
            this.reportTotalStat = stats;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.reportTotalStat = null;
            } else {
              this.reportTotalStat = null;
              this.errorService.handleError(error);
            }
          }
        );
    });
  }
  ngOnDestroy() {
    this.subStat.unsubscribe();
    this.gameStatus.unsubscribe();
  }
}
