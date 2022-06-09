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
      this.getTransportStats(
        config.config.fromDate,
        config.toDate,
        config.group
      )
    ),
    shareReplay(1)
  );
  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) {}

  getCo2Stats(
    campaignId?,
    playerId?,
    dateFrom?: any,
    dateTo?: any
  ): Promise<CampaignPlacing> {
    return this.reportControllerService
      .getPlayerCampaingPlacingByTransportModeUsingGET({
        campaignId,
        playerId,
        metric: 'co2',
        mean: null,
        dateFrom,
        dateTo,
      })
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
    dateFrom?: any,
    dateTo?: any
  ): Promise<CampaignPlacing> {
    return this.reportControllerService
      .getPlayerCampaingPlacingByGameUsingGET({
        campaignId,
        playerId,
        dateFrom,
        dateTo,
      })
      .toPromise();
  }
  getTransportStatsByMeans(
    campaignId: string,
    metric: string,
    groupMode?: string,
    mean?: string,
    dateFrom?: any,
    dateTo?: any
  ): Promise<TransportStats[]> {
    return this.reportControllerService
      .getPlayerTransportStatsUsingGET({
        campaignId,
        metric,
        groupMode,
        mean,
        dateFrom,
        dateTo,
      })
      .toPromise();
  }
  getTransportStats(
    dateFrom?: any,
    dateTo?: any,
    groupMode?: any
  ): Promise<TransportStats[]> {
    return this.reportControllerService
      .getPlayerTransportStatsUsingGET({
        // FIXME: api has changed, and this is not working
        campaignId: null,
        metric: null,

        dateFrom,
        dateTo,
        groupMode,
      })
      .toPromise();
  }

  getStatus(): Promise<PlayerStatus> {
    return this.reportControllerService.getPlayerStatsuUsingGET().toPromise();
  }
}
