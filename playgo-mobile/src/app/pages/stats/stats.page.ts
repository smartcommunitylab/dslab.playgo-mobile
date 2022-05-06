import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AlertController, IonInfiniteScroll, IonRefresher } from '@ionic/angular';
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
import { Subscription } from 'rxjs';
import { ReportService } from 'src/app/core/shared/services/report.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('barCanvas', { static: false }) private barCanvas: ElementRef;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('refresher', { static: false }) refresher: IonRefresher;

  subStat: Subscription;
  barChart: any;
  periodSelected: 'total' | 'week' | 'month' | 'today' = 'total';
  stats: any;
  selectedConf: any;
  constructor(private alertController: AlertController, private reportService: ReportService) { }
  ngOnInit() {
    this.subStat = this.reportService.userStats$.subscribe((stats) => {
      if (stats) {
        this.stats = stats;
      }
      if (this.barChart) {
        this.barChart.destroy();
      }
      console.log(stats);
      this.barChartMethod(stats);
      this.refresher.complete();
    });
  }
  ngOnDestroy() {
    this.subStat.unsubscribe();
  }
  // When we try to call our chart to initialize methods in ngOnInit() it shows an error nativeElement of undefined.
  // So, we need to call all chart methods in ngAfterViewInit() where @ViewChild and @ViewChildren will be resolved.
  ngAfterViewInit() {
    //init selection
    // eslint-disable-next-line max-len
    this.reportService.userStatsHasChanged$.next(this.getConfByData());
    // this.barChartMethod();
  }
  loadNewStat(event) {
    this.reportService.userStatsHasChanged$.next(this.getConfByData(this.selectedConf));
  }
  refresh() {
    this.reportService.userStatsHasChanged$.next(this.getConfByData(this.selectedConf));
  };
  async dialogChangePeriod() {
    const alert = await this.alertController.create({

      cssClass: 'my-custom-class',
      header: 'Seleziona un periodo',
      inputs: [
        {
          name: 'complex',
          type: 'radio',
          label: 'Complessivo',
          value: 'total',
          handler: () => {
            this.periodSelected = 'total';
          },
          checked: this.isSelected('total'),
        },
        {
          name: 'week',
          type: 'radio',
          label: 'Questa settimana',
          value: 'week',
          handler: () => {
            this.periodSelected = 'week';
          },
          checked: this.isSelected('week'),

        },
        {
          name: 'month',
          type: 'radio',
          label: 'Questo mese',
          value: 'month',
          handler: () => {
            this.periodSelected = 'month';
          },
          checked: this.isSelected('month'),
        },
        {
          name: 'today',
          type: 'radio',
          label: 'Oggi',
          value: 'today',
          handler: () => {
            this.periodSelected = 'today';
          },
          checked: this.isSelected('today'),
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('selected cancel');
          },
        },
        {
          text: 'Ok',
          handler: (data: any) => {
            // getThestat and build the charts
            console.log('Saved Information', data);
            this.selectedConf = data;
            //destroy old and rebuild new chart
            //trigger change stats
            // parse selections and make the call
            this.reportService.userStatsHasChanged$.next(this.getConfByData(this.selectedConf));
          },
        },
      ],
    });
    await alert.present();
  }

  getConfByData(data?: any): any {
    if (data === 'total') {
      this.disableInfiniteScroll();
      // eslint-disable-next-line max-len
      return { fromDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'), toDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd') };

    } else {
      this.enableInfiniteScroll();
      // eslint-disable-next-line max-len
      return { fromDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'), toDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'), group: data };

    }
    // eslint-disable-next-line max-len
    // return { fromDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'), toDate: DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd'), ...(data !== 'total' && { group: data }) };
  }
  isSelected(arg0: string): boolean {
    return this.periodSelected === arg0;
  }

  disableInfiniteScroll() {
    this.infiniteScroll.disabled = true;
  }
  enableInfiniteScroll() {
    this.infiniteScroll.disabled = false;
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
    if (!this.barCanvas) { return; }
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
