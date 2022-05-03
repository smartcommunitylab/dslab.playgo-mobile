import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectCustomEvent } from '@ionic/angular';
import { Dictionary } from 'lodash';
import { keyBy } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
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

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id)
  );

  leaderboardTypes$: Observable<LeaderboardType[]> = this.campaignId$.pipe(
    map(() => this.allLeaderboardTypes)
  );

  leaderboardTypeChangedSubject = new Subject<SelectCustomEvent<string>>();
  selectedLeaderboardTypes$ = this.leaderboardTypeChangedSubject.pipe(
    tapLog('selectedLeaderboardTypes$'),
    map((event) => allLeaderboardTypesMap[event.detail.value])
  );

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {}
}

const allLeaderboardTypes: LeaderboardType[] = [
  { value: 'co2', api: 'co2', labelKey: 'campaign.filter.co2' },
  {
    value: 'game',
    api: 'game',
    gameResource: 'GL',
    labelKey: 'campaign.filter.GL',
  },
  ...transportTypes.map((transportType) => ({
    value: transportType,
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
) & { labelKey: string; value: string };
