import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { Player } from 'src/app/core/api/generated/model/player';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
import { ErrorService } from '../../../services/error.service';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';
import { toServerDateOnly } from '../../../time.utils';
import { isOfflineError } from '../../../utils';
import { getCampaignImage } from '../../campaignUtils';

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
  lastPaymentStat: TransportStats;
  imagePath: string;
  lastPaymentDate: any;
  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.imagePath = getCampaignImage(this.campaignContainer);
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
      this.reportService
        .getBikeStats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          toServerDateOnly(DateTime.utc()),
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
      this.getLastPayment();
      this.reportService
        .getBikeStats(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          toServerDateOnly(DateTime.utc().startOf('month')),
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
  getLastPayment() {
    const index = this.campaignContainer.campaign.specificData.periods.length - 1;
    this.lastPaymentDate = this.campaignContainer.campaign.specificData.periods[index].start;
    const to = this.campaignContainer.campaign.specificData.periods[index].end;
    this.reportService
      .getTransportStatsByMeans(
        this.campaignContainer.campaign.campaignId,
        this.profile.playerId,
        'km',
        '',
        'bike',
        toServerDateOnly(DateTime.fromMillis(this.lastPaymentDate).toUTC()),
        toServerDateOnly(DateTime.fromMillis(to).toUTC())
      ).toPromise()
      .then((stats) => {
        this.lastPaymentStat = stats[0];
      })
      .catch((error) => {
        if (isOfflineError(error)) {
          this.reportDayStat = null;
        } else {
          this.reportDayStat = null;
          this.errorService.handleError(error);
        }
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

