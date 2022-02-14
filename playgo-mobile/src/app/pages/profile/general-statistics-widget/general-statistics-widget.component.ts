import { Component, OnInit } from '@angular/core';
import { GeneralStatisticClass } from 'src/app/shared/classes/general-statistic-class';

@Component({
  selector: 'app-general-statistics-widget',
  templateUrl: './general-statistics-widget.component.html',
  styleUrls: ['./general-statistics-widget.component.scss'],
})
export class GeneralStatisticsWidgetComponent implements OnInit {

  statistics?: GeneralStatisticClass;

  constructor() { }

  ngOnInit() {}

}
