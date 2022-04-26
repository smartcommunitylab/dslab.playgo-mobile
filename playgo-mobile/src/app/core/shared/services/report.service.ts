import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthHttpService } from '../../auth/auth-http.service';
import { IGeneralStatistic } from '../model/general-statistic.model';
import { IStatus } from '../model/status.model';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private statusSubject = new ReplaySubject<IStatus>();
  public userStatus$: Observable<IStatus> = this.statusSubject.asObservable();
  constructor(private authHttpService: AuthHttpService) { }

  getLastWeekStatistic(): Promise<IGeneralStatistic> {
    const fromDate = DateTime.local().minus({ week: 1 }).toFormat('yyyy-MM-dd');
    const toDate = DateTime.local().toFormat('yyyy-MM-dd');
    return this.getTransportStats(fromDate, toDate);
  }
  getTransportStats(
    fromDate?: any,
    toDate?: any,
    group?: any
  ): Promise<IGeneralStatistic> {
    return this.authHttpService.request<IGeneralStatistic>(
      'GET',
      environment.serverUrl.transportStats,
      {
        dateFrom: fromDate,
        dateTo: toDate,
        ...(group && { groupMode: group }),
      }
    );
  }
  getStatus(): Promise<IStatus> {
    return this.authHttpService.request<IStatus>(
      'GET',
      environment.serverUrl.status
    );
  }
}
