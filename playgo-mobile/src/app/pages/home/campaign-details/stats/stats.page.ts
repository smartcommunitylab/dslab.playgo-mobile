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
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { isEqual } from 'lodash-es';
import { UserService } from 'src/app/core/shared/services/user.service';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';
import { ReportControllerService } from 'src/app/core/api/generated/controllers/reportController.service';
import { toServerDateOnly } from 'src/app/core/shared/time.utils';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import {
  getPeriods,
  Period,
} from 'src/app/core/shared/campaigns/campaign.utils';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';

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
  statMeanChangedSubject = new Subject<SelectCustomEvent<StatMeanType>>();
  statUnitChangedSubject = new Subject<SelectCustomEvent<StatUnitType>>();
  allStatsMeanTypes: StatMeanType[] = [
    {
      labelKey: 'campaigns.stats.filter.means.walk.label',
      unitKey: 'walk',
    },

    {
      labelKey: 'campaigns.stats.filter.means.bike.label',
      unitKey: 'bike',
    },

    {
      labelKey: 'campaigns.stats.filter.means.boat.label',
      unitKey: 'boat',
    },
    {
      labelKey: 'campaigns.stats.filter.means.train.label',
      unitKey: 'train',
    },
    {
      labelKey: 'campaigns.stats.filter.means.bus.label',
      unitKey: 'bus',
    },
    {
      labelKey: 'campaigns.stats.filter.means.car.label',
      unitKey: 'car',
    },
  ];
  allStatsUnitTypes: StatUnitType[] = [
    {
      labelKey: 'campaigns.stats.filter.unit.km.label',
      unitKey: 'km',
      resultLabel: 'Km',
    },
    {
      labelKey: 'campaigns.stats.filter.unit.co2.label',
      unitKey: 'co2',
      resultLabel: 'Kg',
    },
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
  totalValue = 0;
  periods = getPeriods(this.referenceDate);
  selectedPeriod = this.periods[0];
  statPeriodChangedSubject = new Subject<Period>();
  selectedPeriod$: Observable<Period> = this.statPeriodChangedSubject.pipe(
    map((period) => {
      console.log(period.group);
      this.selectedPeriod = period;
      return this.getPeriodByReference(period);
    }),
    startWith(this.periods[0]),
    shareReplay(1)
  );
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  statsMeanTypes$: Observable<StatMeanType[]> = this.campaignId$.pipe(
    map(() => this.allStatsMeanTypes),
    shareReplay(1)
  );
  statsUnitTypes$: Observable<StatUnitType[]> = this.campaignId$.pipe(
    map(() => this.allStatsUnitTypes),
    shareReplay(1)
  );
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId),
    shareReplay(1)
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

  statResponse$: Observable<TransportStat[]> = this.filterOptions$.pipe(
    switchMap(({ meanType, unitType, period, campaignId, playerId }) =>
      this.reportService
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
  subId: Subscription;
  id: string;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  constructor(
    private route: ActivatedRoute,
    private reportService: ReportControllerService,
    private userService: UserService,
    private errorService: ErrorService,
    private campaignService: CampaignService,
    private pageSettingsService: PageSettingsService
  ) {
    this.statsSubs = this.statResponse$.subscribe((stats) => {
      console.log('new stats' + stats);
      this.barChartMethod(stats);
      this.setTotal(stats);
    });
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
        }
      );
    });
  }
  ionViewWillEnter() {
    this.changePageSettings();
  }

  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }

  setTotal(stats: TransportStat[]) {
    this.totalValue = stats
      .map((stat) => (stat.value >= 0 ? stat.value : 0))
      .reduce((prev, next) => prev + next, 0);
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
    const selects = document.querySelectorAll('.app-alert');
    selects.forEach((select) => {
      (select as any).interfaceOptions = {
        cssClass: 'app-alert',
      };
    });
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
  valuesFromStat(
    arrOfPeriod: DateTime[],
    stats: TransportStat[]
  ): Array<number> {
    //  check if stats[i] is part of arrOfPeriod
    let statsArrayDate = stats.map((stat) => {
      console.log(stat);
      return DateTime.fromObject(this.getObjectDate(stat.period));
    });
    console.log(statsArrayDate);
    const retArr = [];
    for (let period of arrOfPeriod) {
      //check if statsArrayDate has a period
      const i = statsArrayDate.findIndex(
        (statPeriod) => statPeriod.toISO() === period.toISO()
      );
      if (i !== -1) {
        retArr.push(stats[i].value >= 0 ? stats[i].value : 0);
      } else {
        retArr.push(0);
      }
    }
    return retArr;
  }
  barChartMethod(stats?: TransportStat[]) {
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
            //clicked on label x so I have to switch to that view base on what I'm watching
            this.changeView(label);
            //const value = this.barChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
          }
        },
      },
      data: {
        labels: arrOfPeriod.map((period) =>
          period.toFormat(this.selectedPeriod.format)
        ),
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
  getSelectedPeriod() {
    return this.selectedPeriod.from.toFormat(this.selectedPeriod.label);
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
    console.log('Vado a vedere' + label);
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
  resultLabel: string;
};
