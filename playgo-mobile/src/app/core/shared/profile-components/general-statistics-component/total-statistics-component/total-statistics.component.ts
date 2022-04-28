import { Component, OnInit } from '@angular/core';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
// import { IGeneralStatistic } from '../../../model/general-statistic.model';

@Component({
  selector: 'app-total-statistics',
  templateUrl: './total-statistics.component.html',
  styleUrls: ['./total-statistics.component.scss'],
})
export class TotalStatisticsComponent implements OnInit {
  statistics?: TransportStats[];

  constructor() { }

  ngOnInit() { }
}
