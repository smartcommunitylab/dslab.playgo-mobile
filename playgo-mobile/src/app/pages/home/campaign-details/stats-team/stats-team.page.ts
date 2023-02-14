/* eslint-disable prefer-const */
import {
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
import { combineLatest, iif, Observable, of, Subject, Subscription } from 'rxjs';
import { DateTime, Interval } from 'luxon';
import {
  last,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
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
import { TransportType, transportTypeLabels } from 'src/app/core/shared/tracking/trip.model';
import { TranslateKey } from 'src/app/core/shared/globalization/i18n/i18n.utils';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';
import { TeamService } from 'src/app/core/shared/services/team.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsTeamPage implements OnInit, OnDestroy {


  @ViewChild('barCanvas', { static: false }) private barCanvas: ElementRef;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  selectedSegment?: Period;
  barChart: any;
  statsSubs: Subscription;
  selectedMeanChangedSubject = new Subject<SelectCustomEvent<Mean>>();
  selectedMetricChangedSubject = new Subject<SelectCustomEvent<Metric>>();
  meanLabels: Record<Mean, TranslateKey> = {
    ...transportTypeLabels,
    [ALL_MEANS]: 'campaigns.leaderboard.all_means',
    [GL]: 'campaigns.leaderboard.gl',
  };
  metricToNumberWithUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.leaderboard_type_unit.co2',
    km: 'campaigns.leaderboard.leaderboard_type_unit.km',
    time: 'campaigns.leaderboard.leaderboard_type_unit.duration',
    tracks: 'campaigns.leaderboard.leaderboard_type_unit.tracks',
  } as const;
  metricToSelectLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.select.co2',
    km: 'campaigns.leaderboard.select.km',
    time: 'campaigns.leaderboard.select.duration',
    tracks: 'campaigns.leaderboard.select.tracks',
  } as const;
  metricToUnitLabel: Record<Metric, TranslateKey> = {
    co2: 'campaigns.leaderboard.unit.co2',
    km: 'campaigns.leaderboard.unit.km',
    time: 'campaigns.leaderboard.unit.duration',
    tracks: 'campaigns.leaderboard.unit.tracks',
  } as const;
  means$: Observable<Mean[]>;
  selectedMean$: Observable<Mean> = this.selectedMeanChangedSubject.pipe(
    map((event) => event.detail.value),
    startWith(ALL_MEANS),
    shareReplay(1)
  );
  metrics: Metric[];
  selectedMetric$: Observable<Metric> = this.selectedMetricChangedSubject.pipe(
    map((event) => event.detail.value),
    tap((metric) => this.setDivider(metric)),
    startWith(
      // initial select value
      'km' as const
    ),
    shareReplay(1)
  );

  referenceDate = DateTime.local();
  todayDate = DateTime.local();
  totalValue = 0;
  periods = getPeriods(this.referenceDate);
  selectedPeriod = this.periods[0];
  statPeriodChangedSubject = new Subject<Period>();
  selectedPeriod$: Observable<Period> = this.statPeriodChangedSubject.pipe(
    map((period) => {
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

  teamIdSubject = new Subject<string>();
  teamId$: Observable<string> = this.teamIdSubject.pipe(
    tap(id => console.log(id)),
    shareReplay(1)
  );
  // teamId$: Observable<string> = this.userService.userProfile$.pipe(
  //   map((userProfile) => userProfile.playerId),
  //   shareReplay(1)
  // );

  filterOptions$ = combineLatest({
    mean: this.selectedMean$,
    metric: this.selectedMetric$,
    period: this.selectedPeriod$,
    campaignId: this.campaignId$,
    teamId: this.teamId$,
  });

  statResponse$: Observable<TransportStat[]> = this.filterOptions$.pipe(
    switchMap(({ mean, metric, period, campaignId, teamId }) =>
      iif(() => mean !== 'GL'
        , this.teamService
          .getGroupStat(
            campaignId,
            teamId,
            metric,
            period.group,
            mean === ALL_MEANS ? null : mean,
            toServerDateOnly(period.from),
            toServerDateOnly(period.to),
          )
        , this.teamService
          .getGroupGameStats(
            campaignId,
            teamId,
            period.group,
            toServerDateOnly(period.from),
            toServerDateOnly(period.to),
          )
          .pipe(this.errorService.getErrorHandler())
      )
    ));
  subId: Subscription;
  id: string;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  divider = 1000;
  style = getComputedStyle(document.body);

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private userService: UserService,
    private errorService: ErrorService,
    private campaignService: CampaignService,
    private pageSettingsService: PageSettingsService,
    private localDatePipe: LocalDatePipe
  ) {
    this.statsSubs = this.statResponse$.subscribe((stats) => {
      let convertedStat = stats.map(stat => stat.value >= 0 ? { ...stat, value: (stat.value / this.divider) } : { ...stat, value: 0 });
      this.barChartMethod(convertedStat);
      this.setTotal(convertedStat);
    });
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
          if (this.campaignContainer) {
            this.initMeanAndMetrics();
          }
        }
      );
    });
  }
  initMeanAndMetrics() {

    this.metrics = this.campaignContainer.campaign.type === 'company' ? ['co2', 'km'] : ['co2', 'km', 'time', 'tracks'];
    this.means$ = of([ALL_MEANS, ...this.campaignContainer.campaign.validationData.means]);
    // this.selectedMeanChangedSubject.next({
    //   detail: { value: this.campaignContainer?.campaign?.validationData?.means[0] },
    // } as SelectCustomEvent<TransportType>);
  }
  ionViewWillEnter() {
    this.changePageSettings();
  }
  private setDivider(metric: Metric): void {
    switch (metric) {
      case 'co2':
        this.divider = 1;
        break;
      case 'km':
        this.divider = 1000;
        break;
      case 'time':
        this.divider = 3600;
        break;
      case 'tracks':
        this.divider = 1;
        break;
      default:
        this.divider = 1000;

        break;
    }
  }
  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }

  setTotal(stats: any[]) {
    this.totalValue = stats
      .map((stat) => (stat.totalScore ? stat.totalScore : (stat.value >= 0 ? stat.value : 0)))
      .reduce((prev, next) => prev + next, 0);
  }

  ngOnInit() {
    this.selectedSegment = this.periods[0];
    this.teamService.getMyTeam(
      this.campaignContainer?.campaign?.campaignId,
      this.campaignContainer?.subscription?.campaignData?.teamId
    ).pipe(
      map(team => team.id),
      tap(id => this.teamIdSubject.next(id))
    ).subscribe();
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

  thereIsPast(): any {
    // Check if  is not in actual period
    // get future of the button
    let refDate = this.referenceDate.plus({
      [this.selectedPeriod.add]: -1,
    });
    return (refDate.startOf(this.selectedPeriod.add)
      >=
      DateTime.fromMillis(this.campaignContainer.campaign.dateFrom).startOf(this.selectedPeriod.add));
  }
  thereIsFuture(): any {
    // Check if  is not in actual period
    // get future of the button
    let refDate = this.referenceDate.plus({
      [this.selectedPeriod.add]: 1,
    });
    return refDate.startOf(this.selectedPeriod.add) <= this.todayDate.startOf(this.selectedPeriod.add);
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

  daysFromInterval(): Array<any> {
    const retArr = [];
    const start = this.selectedPeriod.from;
    const end = this.selectedPeriod.to;
    const interval = Interval.fromDateTimes(start, end);
    let cursor = interval.start;
    cursor = cursor.startOf(this.selectedPeriod.group);
    while (cursor < interval.end) {
      //begin of the element
      if (this.selectedPeriod.group !== 'week') { retArr.push({ label: cursor.toFormat(this.selectedPeriod.chartFormat), date: cursor }); }
      else {
        retArr.push({
          label: cursor.toFormat(this.selectedPeriod.chartFormat) +
            '-' +
            cursor.endOf('week').toFormat(this.selectedPeriod.chartFormat), date: cursor
        });
      }
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
    stats: any[]
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
        if (stats[i].hasOwnProperty('totalScore')) {
          retArr.push(stats[i].value >= 0 ? stats[i].totalScore : 0);
        } else { retArr.push(stats[i].value >= 0 ? stats[i].value : 0); }
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
    const arrOfValues = this.valuesFromStat(arrOfPeriod.map(period => period.date), stats);

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
            const label = arrOfPeriod.find(data => data.label === this.barChart.data.labels[firstPoint.index])?.date;
            //const label = this.barChart.data.labels[firstPoint.index];
            //clicked on label x so I have to switch to that view base on what I'm watching
            this.changeView(label.toFormat(this.selectedPeriod.format));
            //const value = this.barChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 17,
                weight: '500'
              }
            }
          },
        },

        responsive: true,
        maintainAspectRatio: false,
      },
      data: {
        labels: arrOfPeriod.map((period) =>
          period.label
        ),
        datasets: [
          {
            data: arrOfValues,
            backgroundColor: this.style.getPropertyValue('--ion-color-' + this.campaignContainer.campaign.type),
            borderColor: this.style.getPropertyValue('--ion-color-' + this.campaignContainer.campaign.type),
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      },
    });
  }
  getSelectedPeriod() {
    let date = this.localDatePipe.transform(this.selectedPeriod.from, this.selectedPeriod.label);
    if (this.selectedSegment.group === 'day') {
      date += ' / ' + this.localDatePipe.transform(this.selectedPeriod.to, this.selectedPeriod.label);
    }
    return date.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
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

type Mean = TransportType | typeof ALL_MEANS | typeof GL;
const ALL_MEANS: 'ALL_MEANS' = 'ALL_MEANS';
const GL: 'GL' = 'GL';
type Metric = 'co2' | 'km' | 'tracks' | 'time';

