import { Injectable } from '@angular/core';
import { ReportControllerService } from '../../api/generated/controllers/reportController.service';
import { CampaignPlacing } from '../../api/generated/model/campaignPlacing';
import { GameControllerService } from '../../api/generated/controllers/gameController.service';
import { TransportStat } from '../../api/generated/model/transportStat';
import { PlayerGameStatus } from '../../api/generated/model/playerGameStatus';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private reportControllerService: ReportControllerService,
    private gameController: GameControllerService
  ) { }

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
  getBikeStats(
    campaignId: string,
    playerId: string,
    dateFrom?: string,
    dateTo?: string,
    virtualScoreLabel?: string
  ): Promise<CampaignPlacing> {
    return this.reportControllerService
      .getPlayerTransportStatsUsingGET({
        campaignId,
        playerId,
        metric: virtualScoreLabel ? 'virtualScore' : 'km',
        mean: virtualScoreLabel ? null : 'bike',
        dateFrom,
        dateTo,
      }).pipe(
        map(stats => {
          return {
            value: stats[0] ? stats[0]?.value : 0
          } as CampaignPlacing;;
        })
      ).toPromise();
  }
  getTransportStatsByMeans(
    campaignId: string,
    playerId: string,
    metric: string,
    groupMode?: string,
    mean?: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<TransportStat[]> {
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
}
