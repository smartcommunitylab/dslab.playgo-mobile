import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { find, isEqual, partial } from 'lodash-es';

import { combineLatest, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { DateTime } from 'luxon';

import {
  transportTypeLabels,
  transportTypes,
} from 'src/app/core/shared/tracking/trip.model';
import {
  cartesian,
  startFrom,
  tapLog,
  throwIfNil,
} from 'src/app/core/shared/utils';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { TranslateKey } from 'src/app/core/shared/type.utils';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Campaign } from 'src/app/core/api/generated/model/campaign';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit, AfterViewInit {
  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);

  private metricToNumberWithUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.leaderboard_type_unit.co2',
    km: 'campaigns.leaderboard.leaderboard_type_unit.km',
  } as const;
  private metricToUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.unit.co2',
    km: 'campaigns.leaderboard.unit.km',
  } as const;

  // we need to keep references the same, because they are used as select values.
  private allLeaderboardTypes: LeaderboardType[] = [
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.GL',
      numberWithUnitKey: 'campaigns.leaderboard.leaderboard_type_unit.GL',
      filter: (campaign: Campaign) =>
        campaign.type === 'city' || campaign.type === 'school',
      playerApi: (args) =>
        this.reportControllerService.getPlayerCampaingPlacingByGameUsingGET(
          args
        ),
      leaderboardApi: (args) =>
        this.reportControllerService.getCampaingPlacingByGameUsingGET(args),
    },
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.co2',
      numberWithUnitKey: 'campaigns.leaderboard.leaderboard_type_unit.co2',
      filter: (campaign: Campaign) => campaign.type !== 'school',
      playerApi: (args) =>
        this.reportControllerService.getPlayerCampaingPlacingByTransportModeUsingGET(
          {
            ...args,
            mean: null,
            metric: 'co2',
          }
        ),

      leaderboardApi: (args) =>
        this.reportControllerService.getCampaingPlacingByTransportStatsUsingGET(
          {
            ...args,
            mean: null,
            metric: 'co2',
          }
        ),
    },

    ...cartesian(transportTypes, ['co2', 'km'] as Metric[]).map(
      ([transportType, metric]) => ({
        labelKey: transportTypeLabels[transportType],
        numberWithUnitKey: this.metricToNumberWithUnitLabel[metric],
        unitLabelKey: this.metricToUnitLabel[metric],
        filter: (campaign: Campaign) => campaign.type !== 'school',
        playerApi: (args) =>
          this.reportControllerService.getPlayerCampaingPlacingByTransportModeUsingGET(
            {
              ...args,
              mean: transportType,
              metric,
            }
          ),
        leaderboardApi: (args) =>
          this.reportControllerService.getCampaingPlacingByTransportStatsUsingGET(
            {
              ...args,
              mean: transportType,
              metric,
            }
          ),
      })
    ),
  ];

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  campaign$ = this.campaignId$.pipe(
    switchMap((campaignId) =>
      this.campaignService.allCampaigns$.pipe(
        map((campaigns) => find(campaigns, { campaignId })),
        throwIfNil(() => new Error('Campaign not found')) // TODO: proper error handling
      )
    ),
    shareReplay(1)
  );

  leaderboardTypes$: Observable<LeaderboardType[]> = this.campaign$.pipe(
    map((campaign) => this.getLeaderboardTypes(campaign)),
    shareReplay(1)
  );

  leaderboardTypeChangedSubject = new Subject<
    SelectCustomEvent<LeaderboardType>
  >();

  selectedLeaderboardType$: Observable<LeaderboardType> =
    this.leaderboardTypeChangedSubject.pipe(
      map((event) => event.detail.value),
      startFrom(
        // initial select value
        this.leaderboardTypes$.pipe(
          first(),
          map((allLeaderboardTypes) => allLeaderboardTypes[0])
        )
      ),
      shareReplay(1)
    );
  numberWithUnitKey$: Observable<TranslateKey> =
    this.selectedLeaderboardType$.pipe(
      map((leaderboardType) => leaderboardType.numberWithUnitKey),
      shareReplay(1)
    );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(find(this.periods, { default: true })), // initial select value
    shareReplay(1)
  );

  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );

  filterOptions$ = combineLatest([
    this.selectedLeaderboardType$,
    this.selectedPeriod$,
    this.campaignId$,
    // FIXME: investigate why this is needed.
    this.playerId$.pipe(distinctUntilChanged(isEqual)),
  ]).pipe(
    map(([leaderboardType, period, campaignId, playerId]) => ({
      leaderboardType,
      period,
      campaignId,
      playerId,
    }))
  );

  playerPosition$: Observable<CampaignPlacing> = this.filterOptions$.pipe(
    switchMap(({ leaderboardType, period, campaignId, playerId }) =>
      bind(
        leaderboardType.playerApi,
        this
      )({
        campaignId,
        playerId,
        dateFrom: period.from,
        dateTo: period.to,
      })
    )
  );

  scrollRequestSubject = new Subject<PageableRequest>();

  leaderboardScrollResponse$: Observable<PageCampaignPlacing> =
    this.filterOptions$.pipe(
      switchMap(({ leaderboardType, period, campaignId }) =>
        this.scrollRequestSubject.pipe(
          startWith({
            page: 0,
            size: 10,
          }),
          switchMap(({ page, size }) =>
            bind(
              leaderboardType.leaderboardApi,
              this.reportControllerService
            )({
              campaignId,
              page,
              size,
              sort: null,
              dateFrom: period.from,
              dateTo: period.to,
            })
          )
        )
      )
    );

  resetItems$ = this.filterOptions$.pipe(map(() => Symbol()));

  constructor(
    private route: ActivatedRoute,
    private reportControllerService: ReportControllerService,
    private userService: UserService,
    private campaignService: CampaignService
  ) {}

  getLeaderboardTypes(campaign: Campaign): LeaderboardType[] {
    return this.allLeaderboardTypes.filter((type) => type.filter(campaign));
  }

  getPeriods(referenceDate: DateTime): Period[] {
    return [
      {
        labelKey: 'campaigns.leaderboard.period.today',
        from: this.toServerDate(referenceDate.startOf('day')),
        to: this.toServerDate(referenceDate),
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_week',
        from: this.toServerDate(referenceDate.startOf('week')),
        to: this.toServerDate(referenceDate),
        default: true,
      },
      {
        labelKey: 'campaigns.leaderboard.period.this_month',
        from: this.toServerDate(referenceDate.startOf('month')),
        to: this.toServerDate(referenceDate),
      },
      {
        labelKey: 'campaigns.leaderboard.period.all_time',
        // not specifying dates, will improve the server performance because of special handling
        // but we will lose the confidence that player position and leaderboard are in sync.
        // maybe it is not such deal, "All Time" leaderboard will not change so rapidly.
        from: null, //this.toServerDate(minusInfDate),
        to: null, //this.toServerDate(referenceDate),
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

  ngOnInit() {}
  ngAfterViewInit() {
    const selects = document.querySelectorAll('.app-alert');
    selects.forEach((select) => {
      (select as any).interfaceOptions = {
        cssClass: 'app-alert',
      };
    });
  }
}

type ArgumentsBase = {
  campaignId: string;
  dateFrom: string;
  dateTo: string;
};

type PlayerPlacingArguments = ArgumentsBase & {
  playerId: string;
};

type LeaderboardArguments = ArgumentsBase & {
  page: number;
  size: number;
  sort: string;
};

type LeaderboardType = {
  labelKey: TranslateKey;
  numberWithUnitKey: TranslateKey;
  unitLabelKey?: TranslateKey;
  playerApi: (args: PlayerPlacingArguments) => Observable<CampaignPlacing>;
  leaderboardApi: (
    args: LeaderboardArguments
  ) => Observable<PageCampaignPlacing>;
  filter: (campaign: Campaign) => boolean;
};

type Period = {
  labelKey: TranslateKey;
  from: string;
  to: string;
  default?: boolean;
};

type Metric = 'co2' | 'km';

function bind<F extends (...args: any) => any>(f: F, thisValue: any): F {
  return f.bind(thisValue);
}

function isType(campaign: Campaign, ...type: Campaign.TypeEnum[]): boolean {
  return type.some((t) => campaign.type === t);
}
