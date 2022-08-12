import { Injectable } from '@angular/core';
import { ReportControllerService } from '../../api/generated/controllers/reportController.service';
import { TransportStats } from '../../api/generated/model/transportStats';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { TransportStat } from '../../api/generated/model/transportStat';
import { PlayerStatusReport } from '../../api/generated/model/playerStatusReport';
import { PlayerGameStatus } from '../../api/generated/model/playerGameStatus';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) {}

  getCo2Stats(
    campaignId: string,
    playerId: string,
    dateFrom?: string,
    dateTo?: string
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
  getCo2WeekRecord(
    campaignId: string,
    playerId: string
  ): Promise<TransportStat[]> {
    return this.reportControllerService
      .getPlayerTransportRecordUsingGET({
        campaignId,
        playerId,
        metric: 'co2',
        mean: null,
        groupMode: 'week',
      })
      .toPromise();
  }
  getGameStatus(campaignId: string): Observable<PlayerGameStatus> {
    return this.gameController
      .getCampaignGameStatusUsingGET(campaignId)
      .pipe(shareReplay(1));
  }
  getCurrentLevel(campaignId: string): Observable<number> {
    return this.gameController.getCampaignGameStatusUsingGET(campaignId).pipe(
      map((status) => status?.levels?.length || 0),
      shareReplay()
    );
  }
  getGameStats(
    campaignId?: string,
    playerId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<CampaignPlacing> {
    return this.reportControllerService.getPlayerCampaingPlacingByGameUsingGET({
      campaignId,
      playerId,
      dateFrom,
      dateTo,
    });
  }
  getTransportStatsByMeans(
    campaignId: string,
    playerId: string,
    metric: string,
    groupMode?: string,
    mean?: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<TransportStats[]> {
    return this.reportControllerService.getPlayerTransportStatsUsingGET({
      campaignId,
      playerId,
      metric,
      groupMode,
      mean,
      dateFrom,
      dateTo,
    });
  }

  getStatus(): Promise<PlayerStatusReport> {
    return this.reportControllerService.getPlayerStatusUsingGET().toPromise();
  }
}
