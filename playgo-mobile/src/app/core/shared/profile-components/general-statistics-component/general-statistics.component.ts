import { Component, OnInit } from '@angular/core';
import { GeneralStatisticClass } from 'src/app/core/shared/model/general-statistic-class';

@Component({
  selector: 'app-general-statistics',
  templateUrl: './general-statistics.component.html',
  styleUrls: ['./general-statistics.component.scss'],
})
export class GeneralStatisticsComponent implements OnInit {

  statistics?: GeneralStatisticClass;

  constructor() { }

  ngOnInit() { }

}
