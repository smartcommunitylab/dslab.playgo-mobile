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
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  public userStatsHasChanged$ = new ReplaySubject<any>(1);
  public userStats$ = this.userStatsHasChanged$.pipe(
    switchMap((config) =>
      this.getTransportStats(config.fromDate, config.toDate, config.group)
    ),
    shareReplay(1)
  );
  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) { }

  getCo2Stats(
    campaignId?,
    playerId?,
    fromDate?: any,
    toDate?: any
  ): Promise<CampaignPlacing> {
    return this.reportControllerService
      .getPlayerCampaingPlacingByTransportModeUsingGET(
        campaignId,
        playerId,
        'co2',
        null,
        fromDate,
        toDate
      )
      .toPromise();
  }
  getGameStatus(campaignId: any): Promise<PlayerStatus> {
    return this.gameController
      .getCampaignGameStatusUsingGET(campaignId)
      .toPromise();
  }
  getGameStats(
    campaignId?,
    playerId?,
    fromDate?: any,
    toDate?: any
  ): Promise<CampaignPlacing> {
    return this.reportControllerService
      .getPlayerCampaingPlacingByTransportModeUsingGET(
        campaignId,
        playerId,
        'co2',
        null,
        fromDate,
        toDate
      )
      .toPromise();
  }
  getTransportStatsByMeans(
    campaignId: string,
    metric: string,
    groupMode?: string,
    mean?: string,
    fromDate?: any,
    toDate?: any,
  ): Promise<TransportStats[]> {
    return this.reportControllerService
      .getPlayerTransportStatsUsingGET(campaignId, metric, groupMode, mean, fromDate, toDate)
      .toPromise();
  }
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
