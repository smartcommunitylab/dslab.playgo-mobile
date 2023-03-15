import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { find } from 'lodash-es';

import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { DateTime } from 'luxon';

import {
  TransportType,
  transportTypeLabels,
} from 'src/app/core/shared/tracking/trip.model';
import { throwIfNil } from 'src/app/core/shared/rxjs.utils';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit, OnDestroy {
  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);

  metricToNumberWithUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.leaderboard_type_unit.co2',
    km: 'campaigns.leaderboard.leaderboard_type_unit.km',
  } as const;
  metricToUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.unit.co2',
    km: 'campaigns.leaderboard.unit.km',
  } as const;

  meanLabels: Record<Mean, TranslateKey> = {
    ...transportTypeLabels,
    [ALL_MEANS]: 'campaigns.leaderboard.all_means',
  };

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  campaign$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.allCampaigns$.pipe(
        map((campaigns) => find(campaigns, { campaignId })),
        throwIfNil(() => new Error('Campaign not found')),
        this.errorService.getErrorHandler()
      )
    ),
    shareReplay(1)
  );

  useMeanAndMetric$ = this.campaign$.pipe(
    map((campaign) => campaign.type === 'personal')
  );

  means$: Observable<Mean[]> = this.campaignService.availableMeans$.pipe(
    map((availableMeans) => [ALL_MEANS, ...availableMeans])
  );
  selectedMeanChangedSubject = new Subject<SelectCustomEvent<Mean>>();
  selectedMean$: Observable<Mean> = this.selectedMeanChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(ALL_MEANS),
    shareReplay(1)
  );

  metrics: Metric[] = ['co2', 'km'];
  selectedMetricChangedSubject = new Subject<SelectCustomEvent<Metric>>();
  selectedMetric$: Observable<Metric> = this.selectedMetricChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(
      // initial select value
      'co2' as const
    ),
    shareReplay(1)
  );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(find(this.periods, { default: true })), // initial select value
    shareReplay(1)
  );

  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId),
    distinctUntilChanged()
  );

  filterOptions$ = combineLatest({
    mean: this.selectedMean$,
    metric: this.selectedMetric$,
    period: this.selectedPeriod$,
    campaignId: this.campaignId$,
    useMeanAndMetric: this.useMeanAndMetric$,
    playerId: this.playerId$,
  });

  numberWithUnitKey$: Observable<TranslateKey> = this.filterOptions$.pipe(
    map(({ useMeanAndMetric, metric }) =>
      useMeanAndMetric
        ? this.metricToNumberWithUnitLabel[metric]
        : 'campaigns.leaderboard.leaderboard_type_unit.GL'
    ),
    shareReplay(1)
  );

  playerPosition$: Observable<CampaignPlacing> = this.filterOptions$.pipe(
    switchMap(
      ({ useMeanAndMetric, metric, mean, period, campaignId, playerId }) => {
        if (useMeanAndMetric) {
          return this.reportControllerService
            .getPlayerCampaingPlacingByTransportModeUsingGET({
              campaignId,
              metric,
              mean: mean === ALL_MEANS ? null : mean,
              playerId,
              dateFrom: period.from,
              dateTo: period.to,
            })
            .pipe(this.errorService.getErrorHandler());
        } else {
          return this.reportControllerService
            .getPlayerCampaingPlacingByGameUsingGET({
              campaignId,
              playerId,
              dateFrom: period.from,
              dateTo: period.to,
            })
            .pipe(this.errorService.getErrorHandler());
        }
      }
    ),
    shareReplay(1)
  );

  scrollRequestSubject = new Subject<PageableRequest>();

  leaderboardScrollResponse$: Observable<PageCampaignPlacing> =
    this.filterOptions$.pipe(
      switchMap(({ useMeanAndMetric, metric, mean, period, campaignId }) =>
        this.scrollRequestSubject.pipe(
          startWith({
            page: 0,
            size: 10,
          }),
          switchMap(({ page, size }) => {
            if (useMeanAndMetric) {
              return this.reportControllerService
                .getCampaingPlacingByTransportStatsUsingGET({
                  page,
                  size,
                  campaignId,
                  metric,
                  mean: mean === ALL_MEANS ? null : mean,
                  dateFrom: period.from,
                  dateTo: period.to,
                })
                .pipe(this.errorService.getErrorHandler());
            } else {
              return this.reportControllerService
                .getCampaingPlacingByGameUsingGET({
                  page,
                  size,
                  campaignId,
                  dateFrom: period.from,
                  dateTo: period.to,
                })
                .pipe(this.errorService.getErrorHandler());
            }
          })
        )
      )
    );

  resetItems$ = this.filterOptions$.pipe(map(() => Symbol()));
  subCampaign: Subscription;
  subId: Subscription;
  campaignContainer: PlayerCampaign;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private reportControllerService: ReportControllerService,
    private userService: UserService,
    private campaignService: CampaignService,
    private errorService: ErrorService,
    private pageSettingsService: PageSettingsService
  ) {
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
        }
      );
    });
  }
  ngOnDestroy(): void {
    this.subCampaign.unsubscribe();
    this.subId.unsubscribe();
  }
  ionViewWillEnter() {
    this.changePageSettings();
  }

  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }

  getPeriods(referenceDate: DateTime): Period[] {
    return [
      {
        labelKey: 'campaigns.leaderboard.period.today',
        from: this.toServerDate(referenceDate.startOf('day')),
        to: this.toServerDate(referenceDate),
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_week',
        from: this.toServerDate(referenceDate.startOf('week')),
        to: this.toServerDate(referenceDate),
        default: true,
      },
      {
        labelKey: 'campaigns.leaderboard.period.last_week',
        from: this.toServerDate(
          referenceDate.startOf('week').minus({ weeks: 1 })
        ),
        to: this.toServerDate(referenceDate.startOf('week')),
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_month',
        from: this.toServerDate(referenceDate.startOf('month')),
        to: this.toServerDate(referenceDate),
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.all_time',
        // not specifying dates, will improve the server performance because of special handling
        // but we will lose the confidence that player position and leaderboard are in sync.
        // maybe it is not such deal, "All Time" leaderboard will not change so rapidly.
        from: null, //this.toServerDate(minusInfDate),
        to: null, //this.toServerDate(referenceDate),
        default: false,
      },
    ];
  }

  toServerDate(dateTime: DateTime): string {
    // TODO: This is actually quite tricky bug.
    // When we round reference date to the start of the day, than we get this period
    // from beginning of the day to now, where events affecting this period will
    // cause inconsistent data between the loaded pages of pagination.
    return toServerDateOnly(dateTime);
  }

  ngOnInit() { }
}

type Period = {
  labelKey: TranslateKey;
  from: string;
  to: string;
  default?: boolean;
};

type Metric = 'co2' | 'km';

const ALL_MEANS: 'ALL_MEANS' = 'ALL_MEANS';
type Mean = TransportType | typeof ALL_MEANS;
