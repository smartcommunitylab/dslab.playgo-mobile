import { Injectable } from '@angular/core';
import { ReportControllerService } from '../../api/generated/controllers/reportController.service';
import { PlayerStatus } from '../../api/generated/model/playerStatus';
import { TransportStats } from '../../api/generated/model/transportStats';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';

@Injectable({ providedIn: 'root' })
export class ReportService {

  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) { }

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

  getStatus(): Promise<PlayerStatus> {
    return this.reportControllerService.getPlayerStatsuUsingGET().toPromise();
  }
}
