import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, SelectCustomEvent } from '@ionic/angular';
import { find } from 'lodash-es';

import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
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
import { Campaign } from 'src/app/core/api/generated/model/campaign';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked {
  @ViewChildren('periodSelect')
  public selects: QueryList<IonSelect>;
  private periodSelect: IonSelect;
  @ViewChildren('metricSelect')
  public metricSelects: QueryList<IonSelect>;
  private metricSelect: IonSelect;

  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);
  periodsCompany: Period[];

  metricToNumberWithUnitLabel: Record<Metric | MetricCompany, TranslateKey> = {
    co2: 'campaigns.leaderboard.leaderboard_type_unit.co2',
    km: 'campaigns.leaderboard.leaderboard_type_unit.km',
    virtualScore: 'campaigns.leaderboard.leaderboard_type_unit.GL',
    time: 'campaigns.leaderboard.leaderboard_type_unit.duration',
    tracks: 'campaigns.leaderboard.leaderboard_type_unit.tracks',
    virtualTrack: 'campaigns.leaderboard.leaderboard_type_unit.virtualTrack'
  } as const;
  metricToUnitLabel: Record<any, TranslateKey> = {
    co2: 'campaigns.leaderboard.unit.co2',
    km: 'campaigns.leaderboard.unit.km',
    virtualScore: 'campaigns.leaderboard.unit.virtualScore',
    time: 'campaigns.leaderboard.unit.duration',
    tracks: 'campaigns.leaderboard.unit.tracks',
    virtualTrack: 'campaigns.leaderboard.unit.virtualTrack'
  };

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
    map((campaign) => campaign.type === 'personal' || campaign.type === 'company' && this.campaignContainer?.campaign?.campaignPlacement.active)
  );


  means$: Observable<Mean[]> = this.campaignService.availableMeans$.pipe(
    map((availableMeans) => [ALL_MEANS, ...availableMeans])
  );
  meansForCompany$ = combineLatest([
    this.means$,
    this.campaign$,
  ]).pipe(
    switchMap(([means, campaign]) => {
      if (!campaign?.campaignPlacement?.configuration?.meansShow) {
        return of([ALL_MEANS])
      }
      return of([...means]);
    }
    ))


  selectedMeanChangedSubject = new Subject<SelectCustomEvent<Mean>>();
  selectedMean$: Observable<Mean> = this.selectedMeanChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(ALL_MEANS),
    shareReplay(1)
  );
  metrics: Metric[] = ['co2', 'km'];
  metricsCompany: MetricCompany[] = ['co2', 'km', 'virtualScore', 'time', 'tracks', 'virtualTrack'];
  metrics$: Observable<any[]> = this.campaign$.pipe(
    map((campaign) => {
      campaign?.campaignPlacement?.active ? this.metricToUnitLabel['virtualScore'] = 'campaigns.leaderboard.unit.virtualScore' : null
      return campaign?.campaignPlacement?.active ? [...this.metrics, 'virtualScore'] : [...this.metrics]
    })
  );

  metricsCompany$: Observable<any[]> = this.campaign$.pipe(
    map((campaign) => {
      return this.getMetricsCompany(campaign)
    })
  );


  getMetricsCompany(campaign: Campaign): any {
    // based on available metrics in campaign
    return this.metricsCompany?.filter((metricCompany: any) => campaign?.campaignPlacement?.configuration[metricsCompanyConfigurations.find(metricConf => metricConf.metric === metricCompany).configurationKey] === true);
  }
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
              filterByGroupId: filterByGroup(this.campaignContainer) ? this.campaignContainer?.subscription?.campaignData?.companyKey : null,
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
                  filterByGroupId: filterByGroup(this.campaignContainer) ? this.campaignContainer?.subscription?.campaignData?.companyKey : null,
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
  subMetricSelectChange: Subscription;
  subSelectChange: Subscription;
  campaignContainer: PlayerCampaign;
  id: string;

  constructor(
    private route: ActivatedRoute,
    private reportControllerService: ReportControllerService,
    private userService: UserService,
    private campaignService: CampaignService,
    private errorService: ErrorService,
    private pageSettingsService: PageSettingsService,
    private cdref: ChangeDetectorRef
  ) {
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
          this.filterPeriods(this.campaignContainer);
          this.filterMetrics(this.campaignContainer);
        }
      );
    });
  }
  ngAfterContentChecked(): void {

    this.cdref.detectChanges();
  }

  filterMetrics(campaign: PlayerCampaign) {
    this.selectedMetricChangedSubject.next({ detail: { value: this.metricsCompany.find(metric => campaign?.campaign?.campaignPlacement?.configuration?.metricDefault === metricsCompanyConfigurations.find(metricConf => metricConf.metric === metric).configurationKey) } } as any)

  }
  filterPeriods(campaign: PlayerCampaign) {
    if (campaign?.campaign?.type === 'company') {
      this.periodsCompany = this.getPeriods(this.referenceDate).filter(period => campaign?.campaign?.campaignPlacement?.configuration[period.configurationKey] === true)


      this.periodChangedSubject.next({ detail: { value: this.periodsCompany.find(period => campaign?.campaign?.campaignPlacement?.configuration?.periodDefault === period.configurationKey) } } as any)
      // this.periodChangedSubject.next(new CustomEvent('change', { detail: { value: this.periodsCompany.find(period => campaign?.campaign?.campaignPlacement?.configuration?.periodDefault === period.configurationKey) } }) as any);
      // // this.periodChangedSubject.next(new CustomEvent('change', { detail: { value: this.periodsCompany.find(period => campaign?.campaign?.campaignPlacement?.configuration?.periodDefault === period.configurationKey) } }) as any);
    }

  }

  ngOnDestroy(): void {
    this.subCampaign.unsubscribe();
    this.subId.unsubscribe();


  }
  ionViewWillEnter() {
    this.changePageSettings();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.subSelectChange = this.selects.changes.pipe(startWith(undefined)).subscribe((comps: QueryList<IonSelect>) => {
        if (comps?.length > 0) {
          this.periodSelect = comps.first;
        }
        this.filterPeriods(this.campaignContainer);
      });
      this.subMetricSelectChange = this.metricSelects.changes.pipe(startWith(undefined)).subscribe((comps: QueryList<IonSelect>) => {
        if (comps?.length > 0) {
          this.metricSelect = comps.first;

        }
        this.filterMetrics(this.campaignContainer);
      });
    }, 0);

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
        configurationKey: 'periodToday',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_week',
        from: this.toServerDate(referenceDate.startOf('week')),
        to: this.toServerDate(referenceDate),
        configurationKey: 'periodCurrentWeek',
        default: true,
      },
      {
        labelKey: 'campaigns.leaderboard.period.last_week',
        from: this.toServerDate(
          referenceDate.startOf('week').minus({ weeks: 1 })
        ),
        to: this.toServerDate(referenceDate.startOf('week').minus({ weeks: 1 }).endOf('week')),
        configurationKey: 'periodLastWeek',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_month',
        from: this.toServerDate(referenceDate.startOf('month')),
        to: this.toServerDate(referenceDate),
        configurationKey: 'periodCurrentMonth',
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.all_time',
        // not specifying dates, will improve the server performance because of special handling
        // but we will lose the confidence that player position and leaderboard are in sync.
        // maybe it is not such deal, "All Time" leaderboard will not change so rapidly.
        from: null, //this.toServerDate(minusInfDate),
        to: null, //this.toServerDate(referenceDate),
        configurationKey: 'periodGeneral',
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
  configurationKey: string;
  default?: boolean;
};

type Metric = 'co2' | 'km';
type MetricCompany = 'co2' | 'km' | 'virtualScore' | 'time' | 'tracks' | 'virtualTrack';

const ALL_MEANS: 'ALL_MEANS' = 'ALL_MEANS';
type Mean = TransportType | typeof ALL_MEANS;

function filterByGroup(campaignContainer: PlayerCampaign) {
  return campaignContainer?.campaign?.campaignPlacement?.active;
}

function waitFor<T>(signal: Observable<any>) {
  return (source: Observable<T>) => signal.pipe(
    first(),
    switchMap(_ => source),
  );
}


const metricsCompanyConfigurations = [{
  metric: 'co2',
  configurationKey: 'metricCo2',
},
{
  metric: 'km',
  configurationKey: 'metricDistance',
},
{
  metric: 'virtualScore',
  configurationKey: 'metricVirtualScore',
},
{
  metric: 'time',
  configurationKey: 'metricDuration',
},
{
  metric: 'tracks',
  configurationKey: 'metricTrackNumber',
},
{
  metric: 'virtualTrack',
  configurationKey: 'metricVirtualTrack',
},
]
