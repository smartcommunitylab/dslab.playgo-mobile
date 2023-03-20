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
import { DateTime, Interval } from 'luxon';
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
  filter,
} from 'rxjs';
import { isEqual } from 'lodash-es';

import { ChallengeStatsInfo } from 'src/app/core/api/generated/model/challengeStatsInfo';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import {
  getPeriods,
  Period,
} from 'src/app/core/shared/campaigns/campaign.utils';

@Component({
  selector: 'app-challenges-stat',
  templateUrl: './challenges-stat.component.html',
  styleUrls: ['./challenges-stat.component.scss'],
})
export class ChallengesStatComponent implements OnInit, OnDestroy {

  @ViewChild('barCanvas') private barCanvas: ElementRef;
  // set content(content: ElementRef) {
  //   if (content) { // initially setter gets called with undefined
  //     this.barCanvas = content;
  //   }
  // }
  selectedSegment?: Period;
  campaignChangedSubject = new Subject<SelectCustomEvent<PlayerCampaign>>();
  statPeriodChangedSubject = new Subject<Period>();
  campaigns$ = this.challengeService.campaignsWithChallenges$;
  campaigns: PlayerCampaign[];
  referenceDate = DateTime.local().minus({ weeks: 1 });
  periods = getPeriods(this.referenceDate);
  totalChallenges = 0;
  totalWon = 0;
  selectedPeriod = this.periods[0];
  stats: ChallengeStatsInfo[];
  statsSubs: Subscription;
  campaignsSubs: Subscription;
  barChart: any;
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId),
    shareReplay(1)
  );
  selectedCampaign$: Observable<PlayerCampaign> =
    this.campaignChangedSubject.pipe(
      map((event) => event.detail.value),
      shareReplay(1)
    );
  selectedPeriod$: Observable<Period> = this.statPeriodChangedSubject.pipe(
    map((period) => {
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
    filter((obj) => obj.campaign != null),
    switchMap(({ campaign, period, playerId }) =>
      this.challengeService
        .getChallengeStats({
          campaignId: campaign?.campaign?.campaignId,
          playerId,
          groupMode: period.group,
          dateFrom: toServerDateOnly(period.from),
          dateTo: toServerDateOnly(period.to),
        })
        .pipe(this.errorService.getErrorHandler())
    )
  );
  constructor(
    private challengeService: ChallengeService,
    private userService: UserService,
    private errorService: ErrorService
  ) {
    this.statsSubs = this.statResponse$.subscribe((stats) => {
      this.stats = stats;
      this.setChart(stats);
      this.setTotal(stats);
    });
    this.campaignsSubs = this.campaigns$.subscribe((campaigns) => {
      this.campaigns = campaigns;
      this.campaignChangedSubject.next({
        detail: { value: campaigns[0] },
      } as SelectCustomEvent<PlayerCampaign>);
    });
  }
  setTotal(stats: ChallengeStatsInfo[]) {
    this.totalChallenges = stats
      .map((stat) => stat?.completed + stat?.failed)
      .reduce((prev, next) => prev + next, 0);
    this.totalWon = stats
      .map((stat) => (stat?.completed > 0 ? stat.completed : 0))
      .reduce((prev, next) => prev + next, 0);
  }

  ngOnDestroy(): void {
    this.statsSubs.unsubscribe();
    this.campaignsSubs.unsubscribe();
  }

  ngOnInit() {
    this.selectedSegment = this.periods[0];
  }
  segmentChanged(ev: any) {
    // console.log('Segment changed, change the selected period', ev);
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
  isWeekSelected() {
    return this.selectedPeriod.add === 'week';
  }
  setChart(stats?: ChallengeStatsInfo[]) {
    // Now we need to supply a Chart element reference with an
    //object that defines the type of chart we want to use, and the type of data we want to display.
    // console.log('setChart based on selected tab', this.selectedPeriod);
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
    //build using stats and this.selectedPeriod
    const arrOfPeriod = this.daysFromInterval();
    const arrOfValuesCompleted = this.valuesFromStat(
      arrOfPeriod,
      stats,
      'completed'
    );
    const arrOfValuesFailed = this.valuesFromStat(arrOfPeriod, stats, 'failed');
    // if (stats && stats.length) {
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      options: {
        onClick: (e) => {
          const points = this.barChart.getElementsAtEventForMode(
            e,
            'nearest',
            { intersect: true },
            true
          );

          if (points.length) {
            const firstPoint = points[0];
            const label = this.barChart.data.labels[firstPoint.index];
            this.changeView(label);
          }
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
      data: {
        labels: arrOfPeriod.map((period) =>
          period.toFormat(this.selectedPeriod.format)
        ),
        datasets: [
          {
            data: arrOfValuesCompleted,
            backgroundColor: '#359675',
            borderRadius: 5,
          },
          {
            data: arrOfValuesFailed,
            backgroundColor: '#C61010',
            borderRadius: 5,
          },
        ],
      },
    });
    // }
  }
  valuesFromStat(
    arrOfPeriod: DateTime[],
    stats: ChallengeStatsInfo[],
    type: 'completed' | 'failed'
  ): Array<number> {
    //  check if stats[i] is part of arrOfPeriod
    // const statsArrayDate = stats.map((stat) => {
    //   console.log(stat);
    //   return DateTime.fromObject(this.getObjectDate(stat.period));
    // });
    // console.log(statsArrayDate);
    const retArr = [];
    for (const period of arrOfPeriod) {
      //check if statsArrayDate has a period
      // const i = statsArrayDate.findIndex(
      //   (statPeriod) => statPeriod.toISO() === period.toISO()
      // );
      //get array filtered by period
      const arrayFiltered = stats.filter(
        (stat) =>
          DateTime.fromObject(this.getObjectDate(stat.period)).toISO() ===
          period.toISO()
      );
      if (arrayFiltered.length > 0) {
        retArr.push(arrayFiltered.reduce((prev, next) => prev + next[type], 0));
      } else {
        retArr.push(0);
      }
    }
    return retArr;
  }
  getObjectDate(statPeriod: string) {
    //anno - mese o anno numero settimana o anno mese giorno in base alla selezione
    const periodSplitted = statPeriod.split('-');
    switch (this.selectedPeriod.group) {
      case 'day':
        return {
          year: Number(periodSplitted[0]),
          month: Number(periodSplitted[1]),
          day: Number(periodSplitted[2]),
        };
      case 'week':
        return {
          weekYear: Number(periodSplitted[0]),
          weekNumber: Number(periodSplitted[1]),
        };
      case 'month':
        return {
          year: Number(periodSplitted[0]),
          month: Number(periodSplitted[1]),
        };
    }
  }
  daysFromInterval(): Array<DateTime> {
    const retArr = [];
    const start = this.selectedPeriod.from;
    const end = this.selectedPeriod.to;
    const interval = Interval.fromDateTimes(start, end);
    let cursor = interval.start;
    cursor = cursor.startOf(this.selectedPeriod.group);
    while (cursor < interval.end) {
      //begin of the element
      retArr.push(cursor);
      cursor = cursor.plus({ [this.selectedPeriod.group]: 1 });
    }
    return retArr;
  }
  changeView(label: any) {
    // segmentChanged($event); statPeriodChangedSubject.next(selectedSegment)
    const switchToPeriod: Period = null;
    switch (this.selectedSegment.group) {
      case 'month':
        label = DateTime.fromFormat(label, 'MM-yyyy').toFormat('yyyy-MM-dd');
        break;
      case 'week':
        label = DateTime.fromFormat(label, 'dd-MM-yyyy').toFormat('yyyy-WW');
        break;
      case 'day':
        // label = DateTime.fromFormat(label, 'dd-MM').toFormat('yyyy-MM-dd');
        return;
      default:
        break;
    }
    // change reference date
    //only get but it doesn't write on subject
    this.referenceDate = DateTime.fromObject(this.getObjectDate(label));
    this.periods = getPeriods(this.referenceDate);
    this.selectedSegment = this.periods.find(
      (a) => a.group === this.selectedSegment.switchTo
    );
    this.statPeriodChangedSubject.next(this.selectedSegment);
  }
}
