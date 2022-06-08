import { Component, OnInit } from '@angular/core';
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
import { startFrom, tapLog, throwIfNil } from 'src/app/core/shared/utils';
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
export class LeaderboardPage implements OnInit {
  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);

  // we need to keep references the same, because they are used as select values.
  private allLeaderboardTypes: LeaderboardType[] = [
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.GL',
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.GL',
      filter: (campaign: Campaign) => true,
      playerApi:
        this.reportControllerService.getPlayerCampaingPlacingByGameUsingGET,
      leaderboardApi:
        this.reportControllerService.getCampaingPlacingByGameUsingGET,
    },
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.co2',
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.co2',
      filter: (campaign: Campaign) => campaign.type === 'city',
      playerApi: (
        campaignId: string,
        playerId: string,
        dateFrom: string,
        dateTo: string
      ) =>
        this.reportControllerService.getPlayerCampaingPlacingByTransportModeUsingGET(
          campaignId,
          playerId,
          'co2', //metric
          null, //mean
          dateFrom,
          dateTo
        ),
      leaderboardApi: (
        campaignId: string,
        page?: number,
        size?: number,
        sort?: string,
        dateFrom?: string,
        dateTo?: string
      ) =>
        this.reportControllerService.getCampaingPlacingByTransportStatsUsingGET(
          campaignId,
          page,
          size,
          'co2', //metric
          sort,
          null, //mean
          dateFrom,
          dateTo
        ),
    },

    ...transportTypes.map((transportType) => ({
      labelKey: transportTypeLabels[transportType],
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.km' as const,
      filter: (campaign: Campaign) => true,
      playerApi: (
        campaignId: string,
        playerId: string,
        dateFrom: string,
        dateTo: string
      ) =>
        this.reportControllerService.getPlayerCampaingPlacingByTransportModeUsingGET(
          campaignId,
          playerId,
          'km', //metric,
          transportType,
          dateFrom,
          dateTo
        ),
      leaderboardApi: (
        campaignId: string,
        page?: number,
        size?: number,
        sort?: string,
        dateFrom?: string,
        dateTo?: string
      ) =>
        this.reportControllerService.getCampaingPlacingByTransportStatsUsingGET(
          campaignId,
          page,
          size,
          'km', // metric
          sort,
          transportType,
          dateFrom,
          dateTo
        ),
    })),
  ];

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    distinctUntilChanged(),
    shareReplay(1)
  );

  campaign$ = this.campaignId$.pipe(
    tapLog('campaignId$'),
    switchMap((campaignId) =>
      this.campaignService.allCampaigns$.pipe(
        map((campaigns) => find(campaigns, { campaignId })),
        throwIfNil(() => new Error('Campaign not found')) // TODO: proper error handling
      )
    ),
    tapLog('campaign'),
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
      tapLog('selectedLeaderboardType$'),
      shareReplay(1)
    );
  unitLabelKey$: Observable<TranslateKey> = this.selectedLeaderboardType$.pipe(
    map((leaderboardType) => leaderboardType.unitLabelKey),
    shareReplay(1)
  );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(this.periods[0]), // initial select value
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
      bind(leaderboardType.playerApi, this.reportControllerService)(
        campaignId,
        playerId,
        period.from,
        period.to
      )
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
          tapLog('scrollRequest$'),
          switchMap(({ page, size }) =>
            bind(leaderboardType.leaderboardApi, this.reportControllerService)(
              campaignId,
              page,
              size,
              null,
              period.from,
              period.to
            )
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
}
const minusInfDate = DateTime.fromMillis(0);

type LeaderboardType = {
  labelKey: TranslateKey;
  unitLabelKey: TranslateKey;
  playerApi: PlayerApi;
  leaderboardApi: LeaderboardApi;
  filter: (campaign: Campaign) => boolean;
};

type PlayerApi = (
  campaignId: string,
  playerId: string,
  dateFrom: string,
  dateTo: string
) => Observable<CampaignPlacing>;

type LeaderboardApi = (
  campaignId: string,
  page?: number,
  size?: number,
  sort?: string,
  dateFrom?: string,
  dateTo?: string
) => Observable<PageCampaignPlacing>;

type Period = {
  labelKey: TranslateKey;
  from: string;
  to: string;
};

function bind<F extends (...args: any) => any>(f: F, thisValue: any): F {
  return f.bind(thisValue);
}
