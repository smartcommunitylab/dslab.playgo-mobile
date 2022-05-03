import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dictionary } from 'lodash';
import { keyBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TransportType,
  transportTypeLabels,
  transportTypes,
} from 'src/app/core/shared/tracking/trip.model';

@Component({
  selector: 'app-leaderboars',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  allLeaderboardTypesMap = allLeaderboardTypesMap;
  allLeaderboardTypes = Object.values(allLeaderboardTypesMap);

  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id)
  );

  leaderboardTypes$: Observable<LeaderboardType[]> = this.campaignId$.pipe(
    map(() => this.allLeaderboardTypes)
  );

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {}
}

const allLeaderboardTypesMap: Dictionary<LeaderboardType> = keyBy(
  [
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
  ],
  'value'
);

type LeaderboardType = (
  | { api: 'co2' }
  | { api: 'game'; gameResource: 'GL' }
  | { api: 'transport'; transport: TransportType }
) & { labelKey: string; value: string };
