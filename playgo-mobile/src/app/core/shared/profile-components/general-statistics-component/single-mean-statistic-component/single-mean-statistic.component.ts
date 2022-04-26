import { Component, Input, OnInit } from '@angular/core';
import { IMeansStat } from '../../../model/general-statistic.model';

@Component({
  selector: 'app-single-mean-statistic',
  templateUrl: './single-mean-statistic.component.html',
  styleUrls: ['./single-mean-statistic.component.scss'],
})
export class SingleMeanStatisticComponent implements OnInit {
  @Input() stat: IMeansStat;

  constructor() { }

  ngOnInit() { }
}
