import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { combineLatest, Observable, Subject } from 'rxjs';
import { DateTime } from 'luxon';
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
export class StatsPage implements OnInit, AfterViewInit {

  @ViewChild('barCanvas', { static: false }) private barCanvas: ElementRef;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  selectedSegment?: Period;
  barChart: any;
  stats: any;
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
        period.from,
        period.to
      )
      )
    );
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportControllerService,
    private userService: UserService
  ) { }
  ngOnInit() {
    this.selectedSegment = this.periods[0];
  }
  getPeriodByReference(value: Period): any {
    return this.periods.find((period) => period.group === value.group);
  }
  segmentChanged(ev: any) {
    console.log('Segment changed, change the selected period', ev);
  }
  ngAfterViewInit() {
    this.barChartMethod();
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
        add: 'week',
        from: referenceDate.startOf('week').toFormat('yyyy-MM-dd'),
        to: referenceDate.endOf('week').toFormat('yyyy-MM-dd')
      },
      {
        labelKey: 'campaigns.stats.filter.period.month',
        group: 'week',
        add: 'month',
        from: referenceDate.startOf('month').toFormat('yyyy-MM-dd'),
        to: referenceDate.endOf('month').toFormat('yyyy-MM-dd')
      },
      {
        labelKey: 'campaigns.stats.filter.period.year',
        group: 'month',
        add: 'year',
        from: referenceDate.startOf('year').toFormat('yyyy-MM-dd'),
        to: referenceDate.endOf('month').toFormat('yyyy-MM-dd')
      }
    ];
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
    }
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['BJP', 'INC', 'AAP', 'CPI', 'CPI-M', 'NCP'],
        datasets: [
          {
            label: '# of Votes',
            data: [200, 50, 30, 15, 20, 34],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
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
  group: string;
  from: string;
  to: string;
};
