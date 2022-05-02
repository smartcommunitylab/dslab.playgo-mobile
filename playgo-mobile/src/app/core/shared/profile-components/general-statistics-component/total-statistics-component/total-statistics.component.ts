import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
// import { IGeneralStatistic } from '../../../model/general-statistic.model';

@Component({
  selector: 'app-total-statistics',
  templateUrl: './total-statistics.component.html',
  styleUrls: ['./total-statistics.component.scss'],
})
export class TotalStatisticsComponent implements OnInit, OnChanges {
  @Input() totalStat?: TransportStats[];
  totalKm: number;
  totalJouneys: number;
  totalDays: number;
  constructor() {}

  ngOnInit() {}
  ngOnChanges() {
    this.calculateTotals();
  }
  calculateTotals() {
    this.totalKm =
      this.totalStat.reduce((n, { totalDistance }) => n + totalDistance, 0) /
      1000;
    this.totalJouneys = this.totalStat.reduce(
      (n, { totalTravel }) => n + totalTravel,
      0
    );
    this.totalDays =
      this.totalStat.reduce((n, { totalDuration }) => n + totalDuration, 0) /
      3600;
  }
}
