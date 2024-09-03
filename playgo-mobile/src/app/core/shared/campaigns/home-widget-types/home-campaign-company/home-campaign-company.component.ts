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
  lastPaymentStat: any;
  virtualScoreLabel: string;
  imagePath: string;
  lastPaymentDate: number;
  lastPaymentDateTo: number;
  constructor(
    private userService: UserService,
    private reportService: ReportService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.virtualScoreLabel = this.campaignContainer?.campaign?.specificData?.virtualScore ?
      this.campaignContainer?.campaign?.specificData?.virtualScore?.label : '';
    this.imagePath = getCampaignImage(this.campaignContainer);
    this.subStat = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
      if (this.campaignContainer) {
        this.getServiceFunction(this.campaignContainer, this.profile.playerId, this.campaignContainer.campaign.specificData.virtualScore.firstLimitBar).then((stats) => {
          this.reportDayStat = stats;
          if (!this.campaignContainer?.campaign?.specificData?.virtualScore) { this.reportDayStat.value = this.reportDayStat.value / 1000; }
        })
          .catch((error) => {
            if (isOfflineError(error)) {
              this.reportDayStat = null;
            } else {
              this.reportDayStat = null;
              this.errorService.handleError(error);
            }
          });
        if (this.campaignContainer.campaign.specificData.periods) { this.getLastPayment(); }
        if (this.campaignContainer) {
          this.getServiceFunction(this.campaignContainer, this.profile.playerId, this.campaignContainer.campaign.specificData.virtualScore.secondLimitBar).then((stats) => {
            this.reportMonthStat = stats;
            console.log(this.reportMonthStat?.value);
            if (!this.campaignContainer?.campaign?.specificData?.virtualScore) {
              this.reportMonthStat.value = this.reportMonthStat.value / 1000;
            }
            console.log(this.reportMonthStat?.value);
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
              this.profile.playerId,
              null,
              null,
              this.virtualScoreLabel
            )
            .then((stats) => {
              console.log('stats', stats);
              this.reportTotalStat = stats;
              //if (!this.campaignContainer?.campaign?.specificData?.virtualScore) {
              //  console.log('divido', this.reportTotalStat.value, '/1000');

              //  this.reportTotalStat.value = this.reportTotalStat.value / 1000;
              //console.log('this.reportTotalStat.value', this.reportTotalStat.value);
              // }

            })
            .catch((error) => {
              if (isOfflineError(error)) {
                this.reportTotalStat = null;
              } else {
                this.reportTotalStat = null;
                this.errorService.handleError(error);
              }
            });

        }
      }
    });
  }
  getServiceFunction(campaign: PlayerCampaign, playerId: string, barName: string): Promise<CampaignPlacing> {
    if (!barName) { return Promise.resolve(null); }
    return this.reportService
      .getBarStat(
        campaign.campaign.campaignId,
        playerId,
        this.getPeriod(barName)[0],
        this.getPeriod(barName)[1],
        this.getMetric(barName)
      )
  }
  //first bar firstLimitBar
  getLimitMonthMax(): any {
    return this.campaignContainer?.campaign?.specificData?.virtualScore?.firstLimitBar ?
      this.campaignContainer?.campaign?.specificData?.virtualScore[this.campaignContainer?.campaign?.specificData?.virtualScore?.firstLimitBar] : null
  }
  //secondBar secondLimitBar
  getLimitDayMax(): any {
    return this.campaignContainer?.campaign?.specificData?.virtualScore?.secondLimitBar ?
      this.campaignContainer?.campaign?.specificData?.virtualScore[this.campaignContainer?.campaign?.specificData?.virtualScore?.secondLimitBar] : null
  }
  getUnit(): string {
    return this.campaignContainer?.campaign?.specificData?.virtualScore?.label ? this.campaignContainer?.campaign?.specificData?.virtualScore?.label : (this.campaignContainer?.campaign?.specificData?.virtualScore ? this.virtualScoreLabel : 'Km')
  }
  getLastPayment() {
    const index = this.campaignContainer.campaign.specificData.periods.length - 1;
    if (index !== -1) {
      this.lastPaymentDate = this.campaignContainer.campaign.specificData.periods[index].start;
      this.lastPaymentDateTo = this.campaignContainer.campaign.specificData.periods[index].end;
      this.reportService
        .getTransportStatsByMeans(
          this.campaignContainer.campaign.campaignId,
          this.profile.playerId,
          this.campaignContainer?.campaign?.specificData?.virtualScore ? 'virtualScore' : 'km',
          this.campaignContainer?.campaign?.specificData?.virtualScore ? '' : '',
          this.campaignContainer?.campaign?.specificData?.virtualScore ? '' : 'bike',
          toServerDateOnly(DateTime.fromMillis(Number(this.lastPaymentDate)).toUTC()),
          toServerDateOnly(DateTime.fromMillis(Number(this.lastPaymentDateTo)).toUTC())
        ).toPromise()
        .then((stats) => {
          this.lastPaymentStat = stats[0] ? stats[0] : { mean: null, period: null, value: 0 };
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
  confMetric: any =
    {
      scoreDailyLimit: {
        metric: 'virtualScore',
        period: [toServerDateOnly(DateTime.utc().startOf('day')),
        toServerDateOnly(DateTime.utc()),]

      },
      scoreWeeklyLimit: {
        metric: 'virtualScore',
        period: [toServerDateOnly(DateTime.utc().startOf('week')),
        toServerDateOnly(DateTime.utc()),]
      },
      scoreMonthlyLimit: {
        metric: 'virtualScore',
        period: [toServerDateOnly(DateTime.utc().startOf('month')),
        toServerDateOnly(DateTime.utc()),]
      },
      trackDailyLimit: {
        metric: 'tracks',
        period: [toServerDateOnly(DateTime.utc().startOf('day')),
        toServerDateOnly(DateTime.utc()),]
      },
      trackWeeklyLimit: {
        metric: 'tracks',
        period: [toServerDateOnly(DateTime.utc().startOf('week')),
        toServerDateOnly(DateTime.utc()),]
      },
      trackMonthlyLimit: {
        metric: 'tracks',
        period: [toServerDateOnly(DateTime.utc().startOf('month')),
        toServerDateOnly(DateTime.utc()),]
      }
    }
  getMetric(barName: any): any {
    return this.confMetric[barName]?.metric;
  }
  getPeriod(barName: any): any {
    return this.confMetric[barName]?.period;
  }
}




