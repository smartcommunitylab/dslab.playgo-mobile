import { Component, OnInit } from '@angular/core';
import { GeneralStatistic } from '../../../model/general-statistic.model';

@Component({
  selector: 'app-single-mean-statistic',
  templateUrl: './single-mean-statistic.component.html',
  styleUrls: ['./single-mean-statistic.component.scss'],
})
export class SingleMeanStatisticComponent implements OnInit {
  statistics?: GeneralStatistic;

  constructor() {}

  ngOnInit() {}
}
