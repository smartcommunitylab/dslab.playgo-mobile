import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransportStats } from 'src/app/core/api/generated/model/transportStats';
// import { IGeneralStatistic } from '../../model/general-statistic.model';
import { ReportService } from '../../services/report.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-general-statistics',
  templateUrl: './general-statistics.component.html',
  styleUrls: ['./general-statistics.component.scss'],
})
export class GeneralStatisticsComponent implements OnInit {
  statistics?: TransportStats[];
  fromDate = DateTime.utc().minus({ week: 1 }).toFormat('yyyy-MM-dd');
  toDate = DateTime.utc().toFormat('yyyy-MM-dd');
  constructor(private reportService: ReportService, private router: Router) { }

  ngOnInit() {
    this.initStat();
  }
  initStat() {
    this.reportService
      .getTransportStats(this.fromDate, this.toDate)
      .then((stats) => {
        if (stats) {
          this.statistics = stats;
        }
      });
  }

  getPercentage(statistics, meanStat) {
    //check for every statistics the percentage of our meanStat;
    return 0.5;
  }
  openStats() {
    this.router.navigateByUrl('pages/stats');
  }
}
