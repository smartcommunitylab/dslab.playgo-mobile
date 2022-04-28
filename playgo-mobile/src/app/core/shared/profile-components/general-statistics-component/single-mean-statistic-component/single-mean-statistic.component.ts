import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
  statValue: number;
  // @ViewChild('barCanvas') private barCanvas: ElementRef;
  constructor() { }

  ngOnInit() {
    this.statValue = Math.random();
  }
  ngOnChanges(): void {
    console.log(this.meanStat);
  }

}
