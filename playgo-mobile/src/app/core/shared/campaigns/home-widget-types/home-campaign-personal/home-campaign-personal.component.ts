import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { DateTime } from 'luxon';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Player } from 'src/app/core/api/generated/model/player';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { toServerDateOnly } from '../../../time.utils';
import { isOfflineError } from '../../../utils';
import { ErrorService } from '../../../services/error.service';
import { getCampaignImage } from '../../campaignUtils';

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
  record: TransportStat;
  reportTotalStat: CampaignPlacing;
  imagePath: string;
  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.imagePath = getCampaignImage(this.campaignContainer);
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
      this.reportService
        .getCo2Stats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
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
        .getCo2WeekRecord(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId
        )
        .then((record) => {
          this.record = record[0];
        })
        .catch((error) => {
          if (isOfflineError(error)) {
            this.record = null;
          } else {
            this.record = null;
            this.errorService.handleError(error);
          }
        });
      this.reportService
        .getCo2Stats(
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

  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
}
