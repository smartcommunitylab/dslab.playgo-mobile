import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
// import { IMeansStat } from '../../../model/general-statistic.model';
// import { Chart } from 'chart.js';

@Component({
  selector: 'app-single-mean-statistic',
  templateUrl: './single-mean-statistic.component.html',
  styleUrls: ['./single-mean-statistic.component.scss'],
})
export class SingleMeanStatisticComponent implements OnInit, OnChanges {
  @Input() meanStat: TransportStats;
  @Input() percentage: number;
  // @ViewChild('barCanvas') private barCanvas: ElementRef;
  constructor() {}

  ngOnInit() {}
  ngOnChanges(): void {
    console.log(this.meanStat);
  }
  getHours(seconds: number): number {
    return seconds / 3600;
  }
  getKm(meters: number): number {
    return meters / 1000;
  }
}
