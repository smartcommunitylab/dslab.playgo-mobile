import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AlertController,
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
import { DateTime } from 'luxon';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { transportTypes, transportTypeLabels } from 'src/app/core/shared/tracking/trip.model';
import { TranslateKey } from 'src/app/core/shared/type.utils';
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

  selectedSegment?: string;
  barChart: any;
  stats: any;
  selectedConf: any;
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
    this.campaignId$,
    // FIXME: investigate why this is needed.
    this.playerId$.pipe(distinctUntilChanged(isEqual)),
  ]).pipe(
    map(([meanType, unitType, campaignId, playerId]) => ({
      meanType,
      unitType,
      campaignId,
      playerId,
    }))
  );

  //TODO typing
  statResponse$: Observable<TransportStat[]> =
    this.filterOptions$.pipe(
      switchMap(({ meanType, unitType, campaignId }) => this.reportService.getPlayerTransportStatsUsingGET(
        campaignId,
        unitType.unitKey,
        'week',
        meanType.unitKey,
        DateTime.utc().minus({ week: 20 }).toFormat('yyyy-MM-dd'),
        DateTime.utc().toFormat('yyyy-MM-dd')
      )
      )
    );
  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private reportService: ReportControllerService,
    private userService: UserService
  ) { }
  ngOnInit() {
    this.selectedSegment = 'week';
    // this.subStat = this.reportService.userStats$.subscribe((stats) => {
    //   if (stats) {
    //     this.stats = stats;
    //   }
    //   if (this.barChart) {
    //     this.barChart.destroy();
    //   }
    //   console.log(stats);
    //   this.barChartMethod(stats);
    //   this.refresher.complete();
    // });
  }
  segmentChanged(ev: any) {
    console.log('Segment changed, change the selected period', ev);
  }
  // ngOnDestroy() {
  //   this.subStat.unsubscribe();
  // }
  ngAfterViewInit() {
    //init selection
    // eslint-disable-next-line max-len
    // this.reportService.userStatsHasChanged$.next(this.getConfByData());
    this.barChartMethod();
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
//TODO TranslateKey
type StatMeanType = {
  labelKey: string;
  unitKey: string;
  // playerApi: PlayerApi;
  // leaderboardApi: StatApi;
};
type StatUnitType = {
  labelKey: string;
  unitKey: string;
  // playerApi: PlayerApi;
  // leaderboardApi: StatApi;
};

type PlayerApi = (
  campaignId: string,
  playerId: string,
  dateFrom: string,
  dateTo: string
) => Observable<any>;

type StatApi = (
  campaignId: string,
  page?: number,
  size?: number,
  sort?: string,
  dateFrom?: string,
  dateTo?: string
) => Observable<any>;

type Period = {
  labelKey: TranslateKey;
  from: string;
  to: string;
};

// function bind<F extends (...args: any) => any>(f: F, thisValue: any): F {
//   return f.bind(thisValue);
// }
