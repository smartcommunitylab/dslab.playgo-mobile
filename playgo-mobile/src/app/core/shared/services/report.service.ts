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
import { switchMap, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private statusSubject = new ReplaySubject<PlayerStatus>();
  public userStatus$: Observable<PlayerStatus> =
    this.statusSubject.asObservable();

  public userStatsHasChanged$ = new ReplaySubject<any>(1);
  public userStats$ = this.userStatsHasChanged$.pipe(
    switchMap(config => this.getTransportStats(config.fromDate, config.toDate, config.group)),
    shareReplay()
  );
  constructor(
    private reportControllerService: ReportControllerService
  ) { }

  getTransportStats(
    fromDate?: any,
    toDate?: any,
    group?: any
  ): Promise<TransportStats[]> {
    return this.reportControllerService
      .getPlayerTransportStatsUsingGET(fromDate, toDate, group)
      .toPromise();
  }
  getStatus(): Promise<PlayerStatus> {
    return this.reportControllerService.getPlayerStatsuUsingGET().toPromise();
  }
}
