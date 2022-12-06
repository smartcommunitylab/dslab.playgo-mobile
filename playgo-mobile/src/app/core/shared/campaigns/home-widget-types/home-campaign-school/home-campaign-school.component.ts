import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DateTime } from 'luxon';
import { Observable, Subscription, tap } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';
import { ErrorService } from '../../../services/error.service';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';
import { toServerDateOnly, toServerDateTime } from '../../../time.utils';
import { isOfflineError } from '../../../utils';
import { getCampaignImage } from '../../campaignUtils';
import { TeamStatsControllerService } from 'src/app/core/api/generated-hsc/controllers/teamStatsController.service';
import { CampaignPlacing as PlayerCampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { CampaignPlacing as TeamCampaignPlacing } from 'src/app/core/api/generated-hsc/model/campaignPlacing';
import { TeamService } from '../../../services/team.service';
import { PlacingComparison } from 'src/app/core/api/generated-hsc/model/placingComparison';

@Component({
  selector: 'app-home-campaign-school',
  templateUrl: './home-campaign-school.component.html',
  styleUrls: ['./home-campaign-school.component.scss'],
})
export class HomeCampaignSchoolComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  @Input() header?: boolean = false;
  subStat: Subscription;
  campaignStatus: PlayerGameStatus;
  reportWeekStat: TeamCampaignPlacing;
  reportPersonalWeekStat: PlayerCampaignPlacing;
  reportTotalStat: TeamCampaignPlacing;
  imagePath: string;
  progressionTeam: PlacingComparison;
  progressionPlayer: PlacingComparison;
  referenceDate = DateTime.local();

  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService,
    private teamService: TeamService
  ) { }

  ngOnInit() {
    this.imagePath = getCampaignImage(this.campaignContainer);
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      // this.status = status;
      this.reportService
        .getGameStatus(this.campaignContainer.campaign.campaignId)
        .subscribe(
          (campaignStatus) => {
            this.campaignStatus = campaignStatus;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.campaignStatus = null;
            } else {
              this.campaignStatus = null;
              this.errorService.handleError(error);
            }
          }
        );
      this.teamService.getTeamPlacing(
        this.campaignContainer.campaign.campaignId,
        this.campaignContainer?.subscription?.campaignData?.teamId,
        toServerDateOnly(DateTime.utc().minus({ week: 1 })),
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
      this.teamService.getTeamPlacing(this.campaignContainer.campaign.campaignId,
        this.campaignContainer?.subscription?.campaignData?.teamId
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
      this.teamService.getProgressionTeam(this.campaignContainer.campaign.campaignId,
        this.campaignContainer?.subscription?.campaignData?.teamId,
        toServerDateOnly(this.referenceDate.startOf('week')),
        toServerDateOnly(this.referenceDate.endOf('week'))
      )
        .subscribe(
          (stats) => {
            this.progressionTeam = stats;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.progressionTeam = null;
            } else {
              this.progressionTeam = null;
              this.errorService.handleError(error);
            }
          }
        );
      this.teamService.getProgressionPlayer(this.campaignContainer.campaign.campaignId,
        profile.playerId,
        toServerDateOnly(this.referenceDate.startOf('week')),
        toServerDateOnly(this.referenceDate.endOf('week'))
      )
        .subscribe(
          (stats) => {
            this.progressionPlayer = stats;
          },
          (error) => {
            if (isOfflineError(error)) {
              this.progressionPlayer = null;
            } else {
              this.progressionPlayer = null;
              this.errorService.handleError(error);
            }
          }
        );
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
