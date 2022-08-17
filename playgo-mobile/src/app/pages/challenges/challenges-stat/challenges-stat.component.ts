import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectCustomEvent } from '@ionic/angular';
import {
  Chart,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { DateTime } from 'luxon';
import {
  map,
  Observable,
  Subject,
  shareReplay,
  startWith,
  Subscription,
  switchMap,
  distinctUntilChanged,
  combineLatest,
} from 'rxjs';
import { isEqual } from 'lodash-es';

import { ChallengeStatsInfo } from 'src/app/core/api/generated/model/challengeStatsInfo';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { getPeriods, Period } from 'src/app/core/shared/utils';

@Component({
  selector: 'app-challenges-stat',
  templateUrl: './challenges-stat.component.html',
  styleUrls: ['./challenges-stat.component.scss'],
})
export class ChallengesStatComponent implements OnInit, OnDestroy {
  @ViewChild('barCanvas', { static: false }) private barCanvas: ElementRef;
  selectedSegment?: Period;
  campaignChangedSubject = new Subject<SelectCustomEvent<PlayerCampaign>>();
  statPeriodChangedSubject = new Subject<Period>();
  campaigns$ = this.challengeService.campaignsWithChallenges$;
  referenceDate = DateTime.local();
  periods = getPeriods(this.referenceDate);
  totalValue = 0;
  selectedPeriod = this.periods[0];
  statsSubs: Subscription;
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId),
    shareReplay(1)
  );
  selectedCampaign$: Observable<PlayerCampaign> =
    this.campaignChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(null),
      shareReplay(1)
    );
  selectedPeriod$: Observable<Period> = this.statPeriodChangedSubject.pipe(
    map((period) => {
      console.log(period.group);
      this.selectedPeriod = period;
      return this.getPeriodByReference(period);
    }),
    startWith(this.periods[0]),
    shareReplay(1)
  );
  filterOptions$ = combineLatest([
    this.selectedCampaign$,
    this.selectedPeriod$,
    this.playerId$.pipe(distinctUntilChanged(isEqual)),
  ]).pipe(
    map(([campaign, period, playerId]) => ({
      campaign,
      period,
      playerId,
    }))
  );
  statResponse$: Observable<ChallengeStatsInfo[]> = this.filterOptions$.pipe(
    switchMap(({ campaign, period, playerId }) =>
      this.challengeService.getChallengeSt
        .getPlayerTransportStatsUsingGET({
          campaignId,
          playerId,
          metric: unitType.unitKey,
          groupMode: period.group,
          mean: meanType.unitKey,
          dateFrom: toServerDateOnly(period.from),
          dateTo: toServerDateOnly(period.to),
        })
        .pipe(this.errorService.getErrorHandler())
    )
  );
  constructor(
    private challengeService: ChallengeService,
    private userService: UserService
  ) {
    this.statsSubs = this.statResponse$.subscribe((stats) => {
      console.log('new stats' + stats);
      this.barChartMethod(stats);
      this.setTotal(stats);
    });
  }
  ngOnDestroy(): void {
    this.statsSubs.unsubscribe();
  }

  ngOnInit() {}
  segmentChanged(ev: any) {
    console.log('Segment changed, change the selected period', ev);
  }
  backPeriod() {
    //change referenceDate
    this.referenceDate = this.referenceDate.plus({
      [this.selectedPeriod.add]: -1,
    });
    //only get but it doesn't write on subject
    this.periods = getPeriods(this.referenceDate);
    const tabIndex = this.periods.findIndex(
      (period) => period.group === this.selectedPeriod.group
    );
    this.selectedSegment = this.periods[tabIndex];
    this.statPeriodChangedSubject.next(this.periods[tabIndex]);
  }
  forwardPeriod() {
    this.referenceDate = this.referenceDate.plus({
      [this.selectedPeriod.add]: 1,
    });
    this.periods = getPeriods(this.referenceDate);
    const tabIndex = this.periods.findIndex(
      (period) => period.group === this.selectedPeriod.group
    );
    this.selectedSegment = this.periods[tabIndex];
    this.statPeriodChangedSubject.next(this.periods[tabIndex]);
  }
  getSelectedPeriod() {
    return this.selectedPeriod.from.toFormat(this.selectedPeriod.label);
  }
  getPeriodByReference(value: Period): any {
    return this.periods.find((period) => period.group === value.group);
  }

  barChartMethod(stats?: ChallengeStatsInfo[]) {
    // Now we need to supply a Chart element reference with an
    //object that defines the type of chart we want to use, and the type of data we want to display.
    // eslint-disable-next-line max-len
    Chart.register(
      LineController,
      BarController,
      CategoryScale,
      LinearScale,
      BarElement,
      DoughnutController,
      ArcElement,
      PointElement,
      LineElement
    );
    if (!this.barCanvas) {
      return;
    } else {
      const chartExist = Chart.getChart('statsChart');
      if (chartExist !== undefined) {
        chartExist.destroy();
      }
    }
  }
}
