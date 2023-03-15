import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { DateTime } from 'luxon';
import { find } from 'lodash-es';
import {
  Observable,
  combineLatest,
  Subject,
  Subscription,
  of,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  tap,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
// import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { throwIfNil } from 'src/app/core/shared/rxjs.utils';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { transportTypeLabels, TransportType } from 'src/app/core/shared/tracking/trip.model';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { TeamStatsControllerService } from 'src/app/core/api/generated-hsc/controllers/teamStatsController.service';
import { isInstanceOf } from 'src/app/core/shared/utils';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';

@Component({
  selector: 'app-school-leaderboard',
  templateUrl: './school-leaderboard.page.html',
  styleUrls: ['./school-leaderboard.page.scss'],
})
export class SchoolLeaderboardPage implements OnInit, OnDestroy {
  referenceDate = DateTime.local();
  myTeam: PlayerTeam;
  myTeamSub: Subscription;
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
  playerCampaign$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.myCampaigns$.pipe(
        map((campaigns) => find(campaigns, (playercampaign) => playercampaign.subscription.campaignId === campaignId)),
        throwIfNil(() => new Error('Campaign not found')),
        this.errorService.getErrorHandler()
      )
    ),
    tap(campaign => console.log('playercampaign' + campaign)),
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

  teamId$: Observable<string> = this.playerCampaign$.pipe(
    map(campaign => {
      console.log(campaign);
      return (campaign as PlayerCampaign)?.subscription?.campaignData?.teamId;
    }),
    tap((team: string) => console.log(team)),
    shareReplay(1)
  );
  // this.userService.userProfile$.pipe(
  //   map((userProfile) => userProfile.playerId),
  //   distinctUntilChanged()
  // );
  // this.route.params.pipe(
  //   map((params) => params.id),

  filterOptions$ = combineLatest({
    mean: this.selectedMean$,
    metric: this.selectedMetric$,
    period: this.selectedPeriod$,
    campaignId: this.campaignId$,
    useMeanAndMetric: this.useMeanAndMetric$,
    teamId: this.teamId$,
  });

  numberWithUnitKey$: Observable<TranslateKey> = this.filterOptions$.pipe(
    map(({ useMeanAndMetric, metric }) =>
      useMeanAndMetric
        ? this.metricToNumberWithUnitLabel[metric]
        : 'campaigns.leaderboard.leaderboard_type_unit.GL'
    ),
    shareReplay(1)
  );

  teamPosition$: Observable<CampaignPlacing> = this.filterOptions$.pipe(
    switchMap(
      ({ useMeanAndMetric, metric, mean, period, campaignId, teamId }) => {
        if (useMeanAndMetric) {
          return this.teamStatsControllerService
            .geGroupCampaingPlacingByTransportModeUsingGET({
              campaignId,
              groupId: teamId,
              metric,
              mean: mean === ALL_MEANS ? null : mean,
              dateFrom: period.from,
              dateTo: period.to,
            })
            .pipe(
              map(place => {
                place.groupId = teamId;
                return place;
              }
              ), this.errorService.getErrorHandler());
        } else {
          return this.teamStatsControllerService
            .getGroupCampaingPlacingByGameUsingGET({
              campaignId,
              groupId: teamId,
              dateFrom: period.from,
              dateTo: period.to,
            })
            .pipe(
              map(place => {
                place.groupId = teamId;
                return place;
              }
              ),
              this.errorService.getErrorHandler());
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
              return this.teamStatsControllerService
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
              return this.teamStatsControllerService
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
    private teamService: TeamService,
    private teamStatsControllerService: TeamStatsControllerService,
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
    this.myTeamSub.unsubscribe();
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
        default: false,
      },
      {
        labelKey: 'campaigns.leaderboard.period.last_week',
        from: this.toServerDate(
          referenceDate.startOf('week').minus({ weeks: 1 })
        ),
        to: this.toServerDate(referenceDate.startOf('week')),
        default: true,
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

  ngOnInit() {
    this.myTeamSub = combineLatest([
      this.campaignId$,
      this.teamId$,
    ]).pipe(
      switchMap(([campaignId, teamId]) => this.teamService.getMyTeam(
        campaignId,
        teamId
      ))).subscribe(team => this.myTeam = team);
  }
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
