import { getLocaleDayPeriods } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { Dictionary, partial } from 'lodash';
import { keyBy } from 'lodash-es';

import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';

import {
  TransportType,
  transportTypeLabels,
  transportTypes,
} from 'src/app/core/shared/tracking/trip.model';
import { tapLog } from 'src/app/core/shared/utils';
import { CampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { UserService } from 'src/app/core/shared/services/user.service';

const _ = partial.placeholder;

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  allLeaderboardTypes: LeaderboardType[] = [
    {
      labelKey: 'campaign.filter.co2',
      playerApi:
        this.reportControllerService.getPlayerCampaingPlacingByCo2UsingGET,
      leaderboardApi:
        this.reportControllerService.getCampaingPlacingByCo2UsingGET,
    },
    {
      labelKey: 'campaign.filter.GL',
      playerApi:
        this.reportControllerService.getPlayerCampaingPlacingByGameUsingGET,
      leaderboardApi:
        this.reportControllerService.getCampaingPlacingByGameUsingGET,
    },
    ...transportTypes.map((transportType) => ({
      labelKey: transportTypeLabels[transportType],
      playerApi: partial(
        this.reportControllerService
          .getPlayerCampaingPlacingByTransportModeUsingGET,
        _,
        _,
        transportType
      ),
      leaderboardApi: partial(
        this.reportControllerService.getCampaingPlacingByTransportModeUsingGET,
        _,
        transportType
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

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(this.periods[0]) // initial select value
  );

  filterOptions$ = combineLatest([
    this.selectedLeaderboardType$,
    this.selectedPeriod$,
    this.campaignId$,
    this.userService.userProfile$,
  ]).pipe(
    map(([leaderboardType, period, campaignId, userProfile]) => ({
      leaderboardType,
      period,
      campaignId,
      playerId: userProfile.playerId,
    }))
  );

  playerPosition$: Observable<CampaignPlacing> = this.filterOptions$.pipe(
    switchMap(({ leaderboardType, period, campaignId, playerId }) =>
      leaderboardType.playerApi.bind(this.reportControllerService)(
        campaignId,
        playerId,
        period.from,
        period.to
      )
    )
  );

  constructor(
    private route: ActivatedRoute,
    private reportControllerService: ReportControllerService,
    private userService: UserService
  ) {}

  getPeriods(referenceDate: DateTime): Period[] {
    return [
      {
        labelKey: 'campaigns.period.today',
        from: referenceDate.startOf('day').toUTC().toISO(),
        to: referenceDate.toUTC().toISO(),
      },
      {
        labelKey: 'campaigns.period.this_week',
        from: referenceDate.startOf('week').toUTC().toISO(),
        to: referenceDate.toUTC().toISO(),
      },
      {
        labelKey: 'campaigns.period.this_month',
        from: referenceDate.startOf('month').toUTC().toISO(),
        to: referenceDate.toUTC().toISO(),
      },
      {
        labelKey: 'campaigns.period.all_time',
        from: '',
        to: referenceDate.toUTC().toISO(),
      },
    ];
  }

  ngOnInit() {}
}

type LeaderboardType = {
  labelKey: string;
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
  dateFrom?: string,
  dateTo?: string
) => Observable<PageCampaignPlacing>;

type Period = {
  labelKey: string;
  from: string;
  to: string;
};
