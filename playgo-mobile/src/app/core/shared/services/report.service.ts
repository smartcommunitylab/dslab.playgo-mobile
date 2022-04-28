import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { AuthHttpService } from '../../auth/auth-http.service';
// import { IGeneralStatistic } from '../model/general-statistic.model';
// import { IStatus } from '../model/status.model';
import { DateTime } from 'luxon';
import { ReportControllerService } from '../../api/generated/controllers/reportController.service';
import { PlayerStatus } from '../../api/generated/model/playerStatus';
import { TransportStats } from '../../api/generated/model/transportStats';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private statusSubject = new ReplaySubject<PlayerStatus>();
  public userStatus$: Observable<PlayerStatus> = this.statusSubject.asObservable();
  constructor(
    // private authHttpService: AuthHttpService
    private reportControllerService: ReportControllerService
  ) { }

  // getLastWeekStatistic(): Promise<TransportStats[]> {
  //   const fromDate = DateTime.local().minus({ week: 1 }).toFormat('yyyy-MM-dd');
  //   const toDate = DateTime.local().toFormat('yyyy-MM-dd');
  //   return this.getTransportStats(fromDate, toDate);
  // }
  getTransportStats(
    fromDate?: any,
    toDate?: any,
    group?: any
  ): Promise<TransportStats[]> {
    return this.reportControllerService.getPlayerTransportStatsUsingGET(fromDate, toDate, group).toPromise();
    // return this.authHttpService.request<IGeneralStatistic>(
    //   'GET',
    //   environment.serverUrl.transportStats,
    //   {
    //     dateFrom: fromDate,
    //     dateTo: toDate,
    //     ...(group && { groupMode: group }),
    //   }
    // );
  }
  getStatus(): Promise<PlayerStatus> {
    return this.reportControllerService.getPlayerStatsuUsingGET().toPromise();
    //   return this.authHttpService.request<IStatus>(
    //     'GET',
    //     environment.serverUrl.status
    //   );
    // }
  }
}
