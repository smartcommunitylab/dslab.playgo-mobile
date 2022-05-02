import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AlertController } from '@ionic/angular';
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

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, AfterViewInit {
  @ViewChild('barCanvas') private barCanvas: ElementRef;

  barChart: any;
  periodSelected: 'Complessivo';
  constructor(private alertController: AlertController) {}
  ngOnInit() {}

  // When we try to call our chart to initialize methods in ngOnInit() it shows an error nativeElement of undefined.
  // So, we need to call all chart methods in ngAfterViewInit() where @ViewChild and @ViewChildren will be resolved.
  ngAfterViewInit() {
    this.barChartMethod();
  }
  async dialogChangePeriod() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Seleziona un periodo',
      inputs: [
        {
          name: 'complex',
          type: 'radio',
          label: 'Complessivo',
          value: 'complex',
          handler: () => {
            console.log('Radio 1 selected');
          },
          checked: true,
        },
        {
          name: 'week',
          type: 'radio',
          label: 'Questa settimana',
          value: 'week',
          handler: () => {
            console.log('Radio 2 selected');
          },
        },
        {
          name: 'month',
          type: 'radio',
          label: 'Questo mese',
          value: 'month',
          handler: () => {
            console.log('Radio 3 selected');
          },
        },
        {
          name: 'today',
          type: 'radio',
          label: 'Oggi',
          value: 'today',
          handler: () => {
            console.log('Radio 4 selected');
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Ok',
          handler: (data: any) => {
            console.log('Saved Information', data);
            this.barChart.destroy();
            this.barChartMethod();
          },
        },
      ],
    });
    await alert.present();
  }
  barChartMethod() {
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
