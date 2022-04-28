import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
// import { IMeansStat } from '../../../model/general-statistic.model';

@Component({
  selector: 'app-single-mean-statistic',
  templateUrl: './single-mean-statistic.component.html',
  styleUrls: ['./single-mean-statistic.component.scss'],
})
export class SingleMeanStatisticComponent implements OnInit, OnChanges {
  @Input() meanStat: TransportStats;

  constructor() { }

  ngOnInit() { }
  ngOnChanges(): void {
    console.log(this.meanStat);
  }
}
