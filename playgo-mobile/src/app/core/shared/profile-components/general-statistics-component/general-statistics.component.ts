import { Component, OnInit } from '@angular/core';
import { IGeneralStatistic } from '../../model/general-statistic.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-general-statistics',
  templateUrl: './general-statistics.component.html',
  styleUrls: ['./general-statistics.component.scss'],
})
export class GeneralStatisticsComponent implements OnInit {
  statistics?: IGeneralStatistic;

  constructor(private reportService: ReportService) { }

  ngOnInit() {
    this.initStat();

  }
  initStat() {
    this.reportService.getLastWeekStatistic().then((stats) => {
      if (stats) { this.statistics = stats; }
    });
  }
}
