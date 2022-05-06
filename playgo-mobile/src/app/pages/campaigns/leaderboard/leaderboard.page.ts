import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { isEqual, partial } from 'lodash-es';

import { combineLatest, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { DateTime } from 'luxon';

import {
  transportTypeLabels,
  transportTypes,
} from 'src/app/core/shared/tracking/trip.model';
import { tapLog } from 'src/app/core/shared/utils';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { TranslateKey } from 'src/app/core/shared/type.utils';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  allLeaderboardTypes: LeaderboardType[] = [
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.co2',
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.co2',
      playerApi:
        this.reportControllerService.getPlayerCampaingPlacingByCo2UsingGET,
      leaderboardApi:
        this.reportControllerService.getCampaingPlacingByCo2UsingGET,
    },
    {
      labelKey: 'campaigns.leaderboard.leaderboard_type.GL',
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.GL',
      playerApi:
        this.reportControllerService.getPlayerCampaingPlacingByGameUsingGET,
      leaderboardApi:
        this.reportControllerService.getCampaingPlacingByGameUsingGET,
    },
    ...transportTypes.map((transportType) => ({
      labelKey: transportTypeLabels[transportType],
      unitLabelKey: 'campaigns.leaderboard.leaderboard_type_unit.km' as const,
      playerApi: (
        campaignId: string,
        playerId: string,
        dateFrom: string,
        dateTo: string
      ) =>
        this.reportControllerService.getPlayerCampaingPlacingByTransportModeUsingGET(
          campaignId,
          playerId,
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
        this.reportControllerService.getCampaingPlacingByTransportModeUsingGET(
          campaignId,
          page,
          size,
          transportType,
          sort,
          dateFrom,
          dateTo
        ),
    })),
  ];

  referenceDate = DateTime.local();
  periods = this.getPeriods(this.referenceDate);

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id)
  );

  leaderboardTypes$: Observable<LeaderboardType[]> = this.campaignId$.pipe(
    map(() => this.allLeaderboardTypes)
  );

  leaderboardTypeChangedSubject = new Subject<
    SelectCustomEvent<LeaderboardType>
  >();

  selectedLeaderboardType$: Observable<LeaderboardType> =
    this.leaderboardTypeChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(this.allLeaderboardTypes[0]) // initial select value
    );
  unitLabelKey$: Observable<TranslateKey> = this.selectedLeaderboardType$.pipe(
    map((leaderboardType) => leaderboardType.unitLabelKey)
  );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(this.periods[0]) // initial select value
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
    private userService: UserService
  ) {}

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
    return dateTime.toUTC().toFormat('yyyy-MM-dd');
  }

  ngOnInit() {}
}
const minusInfDate = DateTime.fromMillis(0);

type LeaderboardType = {
  labelKey: TranslateKey;
  unitLabelKey: TranslateKey;
  playerApi: PlayerApi;
  leaderboardApi: LeaderboardApi;
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
