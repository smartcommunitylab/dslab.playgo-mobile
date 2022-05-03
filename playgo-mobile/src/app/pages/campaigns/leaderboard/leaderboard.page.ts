import { getLocaleDayPeriods } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { Dictionary } from 'lodash';
import { keyBy } from 'lodash-es';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DateTime } from 'luxon';

import {
  TransportType,
  transportTypeLabels,
  transportTypes,
} from 'src/app/core/shared/tracking/trip.model';
import { tapLog } from 'src/app/core/shared/utils';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  allLeaderboardTypes = allLeaderboardTypes;
  allLeaderboardTypesMap = allLeaderboardTypesMap;

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

  selectedLeaderboardTypes$: Observable<LeaderboardType> =
    this.leaderboardTypeChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(allLeaderboardTypes[0]) // initial select value
    );

  periodChangedSubject = new Subject<SelectCustomEvent<Period>>();
  selectedPeriod$: Observable<Period> = this.periodChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(this.periods[0]) // initial select value
  );

  filterOptions$ = combineLatest([
    this.selectedLeaderboardTypes$,
    this.selectedPeriod$,
  ]).pipe(
    map(([leaderboardTypes, period]) => ({
      leaderboardTypes,
      period,
    }))
  );

  constructor(private route: ActivatedRoute) {}

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

const allLeaderboardTypes: LeaderboardType[] = [
  { api: 'co2', labelKey: 'campaign.filter.co2' },
  {
    api: 'game',
    gameResource: 'GL',
    labelKey: 'campaign.filter.GL',
  },
  ...transportTypes.map((transportType) => ({
    api: 'transport' as const,
    transport: transportType,
    labelKey: transportTypeLabels[transportType],
  })),
];

const allLeaderboardTypesMap: Dictionary<LeaderboardType> = keyBy(
  allLeaderboardTypes,
  'value'
);

type LeaderboardType = (
  | { api: 'co2' }
  | { api: 'game'; gameResource: 'GL' }
  | { api: 'transport'; transport: TransportType }
) & { labelKey: string };

type Period = {
  labelKey: string;
  from: string;
  to: string;
};
