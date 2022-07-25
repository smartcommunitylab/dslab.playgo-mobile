import { Injectable } from '@angular/core';
import { ReportControllerService } from '../../api/generated/controllers/reportController.service';
import { PlayerStatus } from '../../api/generated/model/playerStatus';
import { TransportStats } from '../../api/generated/model/transportStats';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { TransportStat } from '../../api/generated/model/transportStat';
import { PlayerStatusReport } from '../../api/generated/model/playerStatusReport';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) {}

  getCo2Stats(
    campaignId?: string,
    playerId?: string,
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
  getCo2WeekRecord(campaignId?: string): Promise<TransportStat[]> {
    return this.reportControllerService
      .getPlayerTransportRecordUsingGET({
        campaignId,
        metric: 'co2',
        mean: null,
        groupMode: 'week',
      })
      .toPromise();
  }
  getGameStatus(campaignId: string): Promise<PlayerStatus> {
    return this.gameController.getPlayerStatusUsingGET(campaignId).toPromise();
  }
  getGameStats(
    campaignId?: string,
    playerId?: string,
    dateFrom?: string,
    dateTo?: string
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
    dateFrom?: string,
    dateTo?: string
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

  getStatus(): Promise<PlayerStatusReport> {
    return this.reportControllerService.getPlayerStatusUsingGET1().toPromise();
  }
}
