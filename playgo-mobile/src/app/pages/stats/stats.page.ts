/* eslint-disable prefer-const */
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonInfiniteScroll,
  IonRefresher,
  SelectCustomEvent,
} from '@ionic/angular';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { DateTime, DateTimeUnit, Interval } from 'luxon';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { isEqual } from 'lodash-es';
import { UserService } from 'src/app/core/shared/services/user.service';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';


@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('barCanvas', { static: false }) private barCanvas: ElementRef;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  selectedSegment?: Period;
  barChart: any;
  statsSubs: Subscription;
  statMeanChangedSubject = new Subject<
    SelectCustomEvent<StatMeanType>
  >();
  statUnitChangedSubject = new Subject<SelectCustomEvent<StatUnitType>>();
  allStatsMeanTypes: StatMeanType[] = [
    {
      labelKey: 'campaigns.stats.filter.means.car.label',
      unitKey: 'car'
    },
    {
      labelKey: 'campaigns.stats.filter.means.bike.label',
      unitKey: 'bike'
    },
    {
      labelKey: 'campaigns.stats.filter.means.walk.label',
      unitKey: 'walk'
    },
    {
      labelKey: 'campaigns.stats.filter.means.boat.label',
      unitKey: 'boat'
    },
    {
      labelKey: 'campaigns.stats.filter.means.train.label',
      unitKey: 'train'
    },
    {
      labelKey: 'campaigns.stats.filter.means.bus.label',
      unitKey: 'bus'
    }
  ];
  allStatsUnitTypes: StatUnitType[] = [
    {
      labelKey: 'campaigns.stats.filter.unit.km.label',
      unitKey: 'km'
    },
    {
      labelKey: 'campaigns.stats.filter.unit.co2.label',
      unitKey: 'co2'
    }
  ];

  selectedStatMeanType$: Observable<StatMeanType> =
    this.statMeanChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(this.allStatsMeanTypes[0]),
      shareReplay(1)
    );
  selectedStatUnitType$: Observable<StatUnitType> =
    this.statUnitChangedSubject.pipe(
      map((event) => event.detail.value),
      startWith(this.allStatsUnitTypes[0]),
      shareReplay(1)
    );
  referenceDate = DateTime.local();
  // initPeriods = this.getPeriods(this.referenceDate);
  periods = this.getPeriods(this.referenceDate);
  selectedPeriod = this.periods[0];
  statPeriodChangedSubject = new Subject<Period>();
  selectedPeriod$: Observable<Period> =
    this.statPeriodChangedSubject.pipe(
      map((period) => {
        console.log(period.group);
        this.selectedPeriod = period;
        return this.getPeriodByReference(period);
      }),
      startWith(this.periods[0]),
      shareReplay(1)
    );
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id,
      shareReplay(1))
  );
  statsMeanTypes$: Observable<StatMeanType[]> = this.campaignId$.pipe(
    map(() => this.allStatsMeanTypes,
      shareReplay(1))
  );
  statsUnitTypes$: Observable<StatUnitType[]> = this.campaignId$.pipe(
    map(() => this.allStatsUnitTypes,
      shareReplay(1))
  );
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId,
      shareReplay(1))
  );
  filterOptions$ = combineLatest([
    this.selectedStatMeanType$,
    this.selectedStatUnitType$,
    this.selectedPeriod$,
    this.campaignId$,
    // FIXME: investigate why this is needed.
    this.playerId$.pipe(distinctUntilChanged(isEqual)),
  ]).pipe(
    map(([meanType, unitType, period, campaignId, playerId]) => ({
      meanType,
      unitType,
      period,
      campaignId,
      playerId,
    }))
  );

  //TODO typing
  statResponse$: Observable<TransportStat[]> =
    this.filterOptions$.pipe(
      switchMap(({ meanType, unitType, period, campaignId }) => this.reportService.getPlayerTransportStatsUsingGET(
        campaignId,
        unitType.unitKey,
        period.group,
        meanType.unitKey,
        period.from.toFormat('yyyy-MM-dd'),
        period.to.toFormat('yyyy-MM-dd')
      )
      )
    );
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportControllerService,
    private userService: UserService
  ) {
    this.statsSubs = this.statResponse$.subscribe((stats) => {
      console.log('new stats' + stats);
      this.barChartMethod(stats);
    });
  }

  ngOnInit() {
    this.selectedSegment = this.periods[0];
  }
  ngOnDestroy() {
    this.statsSubs.unsubscribe();
  }
  getPeriodByReference(value: Period): any {
    return this.periods.find((period) => period.group === value.group);
  }
  segmentChanged(ev: any) {
    console.log('Segment changed, change the selected period', ev);
  }
  ngAfterViewInit() {
    //this.barChartMethod();
  }
  backPeriod() {
    //change referenceDate
    this.referenceDate = this.referenceDate.plus({ [this.selectedPeriod.add]: -1 });
    //only get but it doesn't write on subject
    this.periods = this.getPeriods(this.referenceDate);
    const tabIndex = this.periods.findIndex((period) => period.group === this.selectedPeriod.group);
    this.selectedSegment = this.periods[tabIndex];
    this.statPeriodChangedSubject.next(this.periods[tabIndex]);
  }
  forwardPeriod() {
    this.referenceDate = this.referenceDate.plus({ [this.selectedPeriod.add]: 1 });
    this.periods = this.getPeriods(this.referenceDate);
    const tabIndex = this.periods.findIndex((period) => period.group === this.selectedPeriod.group);
    this.selectedSegment = this.periods[tabIndex];
    this.statPeriodChangedSubject.next(this.periods[tabIndex]);
  }
  getPeriods(referenceDate: DateTime): Period[] {
    return [
      {
        labelKey: 'campaigns.stats.filter.period.week',
        group: 'day',
        format: 'dd-MM',
        add: 'week',
        from: referenceDate.startOf('week'),
        to: referenceDate.endOf('week')
      },
      {
        labelKey: 'campaigns.stats.filter.period.month',
        group: 'week',
        format: 'WW-MMM',
        add: 'month',
        from: referenceDate.startOf('month'),
        to: referenceDate.endOf('month')
      },
      {
        labelKey: 'campaigns.stats.filter.period.year',
        group: 'month',
        format: 'MM-yyyy',
        add: 'year',
        from: referenceDate.startOf('year'),
        to: referenceDate.endOf('year')
      }
    ];
  }
  // adjust this for your exact needs
  // days(interval, timePeriod) {
  //   let cursor = interval.start.startOf(timePeriod);
  //   while (cursor < interval.end) {
  //     yield cursor;
  //     cursor = cursor.plus({ [timePeriod]: 1 });
  //   }
  // }

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
  getObjectDate(statPeriod) {
    //anno - mese o anno numero settimana o anno mese giorno in base alla selezione
    const periodSplitted = statPeriod.split('-');
    switch (this.selectedPeriod.group) {
      case 'day':
        return { year: periodSplitted[0], month: periodSplitted[1], day: periodSplitted[2] };
      case 'week':
        return { weekYear: periodSplitted[0], weekNumber: periodSplitted[1] };
      case 'month':
        return { year: periodSplitted[0], month: periodSplitted[1] };
    }
  }
  valuesFromStat(arrOfPeriod: DateTime[], stats: any): Array<number> {
    //  check if stats[i] is part of arrOfPeriod
    let statsArrayDate = stats.map(stat => {
      console.log(stat);
      // return DateTime.fromObject({ year: 2022, weekNumber: 10 });
      return DateTime.fromObject(this.getObjectDate(stat.period));
    });
    console.log(statsArrayDate);
    const retArr = [];
    for (let period of arrOfPeriod) {
      //check if statsArrayDate has a period
      const i = statsArrayDate.findIndex(statPeriod => statPeriod.toISO() === period.toISO());
      if (i !== -1) {
        retArr.push(stats[i].value);
      } else {
        retArr.push(0);
      }
    }
    return retArr;
  }
  barChartMethod(stats?: any) {
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

    //build using stats and this.selectedPeriod
    const arrOfPeriod = this.daysFromInterval();
    const arrOfValues = this.valuesFromStat(arrOfPeriod, stats);

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: arrOfPeriod.map((period) => period.toFormat(this.selectedPeriod.format)),
        datasets: [
          {
            data: arrOfValues,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
    });
  }


}
//TODO TranslateKey instead string
type StatMeanType = {
  labelKey: string;
  unitKey: string;

};
type StatUnitType = {
  labelKey: string;
  unitKey: string;
};

type Period = {
  labelKey: string;
  add: string;
  format: string;
  group: DateTimeUnit;
  from: DateTime;
  to: DateTime;
};
