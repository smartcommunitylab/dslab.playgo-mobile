/**
 * Play&Go Project
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 2.0
 * Contact: info@smartcommunitylab.it
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CampaignPlacing } from '../model/campaignPlacing';
import { GameStats } from '../model/gameStats';
import { PageCampaignPlacing } from '../model/pageCampaignPlacing';
import { PlayerStatusReport } from '../model/playerStatusReport';
import { TransportStat } from '../model/transportStat';

@Injectable({
  providedIn: 'root',
})
export class ReportControllerService {
  constructor(private http: HttpClient) {}
  /**
   * getCampaingPlacingByGame
   *
   * @param campaignId campaignId
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param sort Sorting option: field,[asc,desc]
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getCampaingPlacingByGameUsingGET(args: {
    campaignId: string;
    page: number;
    size: number;
    sort?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<PageCampaignPlacing> {
    const { campaignId, page, size, sort, dateFrom, dateTo } = args;
    return this.http.request<PageCampaignPlacing>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/campaign/placing/game`,
      {
        params: removeNullOrUndefined({
          campaignId,
          page,
          size,
          sort,
          dateFrom,
          dateTo,
        }),
      }
    );
  }

  /**
   * getCampaingPlacingByTransportStats
   *
   * @param campaignId campaignId
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param metric metric
   * @param sort Sorting option: field,[asc,desc]
   * @param mean mean
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getCampaingPlacingByTransportStatsUsingGET(args: {
    campaignId: string;
    page: number;
    size: number;
    metric: string;
    sort?: string;
    mean?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<PageCampaignPlacing> {
    const { campaignId, page, size, metric, sort, mean, dateFrom, dateTo } =
      args;
    return this.http.request<PageCampaignPlacing>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/report/campaign/placing/transport`,
      {
        params: removeNullOrUndefined({
          campaignId,
          page,
          size,
          sort,
          metric,
          mean,
          dateFrom,
          dateTo,
        }),
      }
    );
  }

  /**
   * getPlayerCampaingPlacingByGame
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getPlayerCampaingPlacingByGameUsingGET(args: {
    campaignId: string;
    playerId: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<CampaignPlacing> {
    const { campaignId, playerId, dateFrom, dateTo } = args;
    return this.http.request<CampaignPlacing>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/report/campaign/placing/player/game`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
          dateFrom,
          dateTo,
        }),
      }
    );
  }

  /**
   * getPlayerCampaingPlacingByTransportMode
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param metric metric
   * @param mean mean
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getPlayerCampaingPlacingByTransportModeUsingGET(args: {
    campaignId: string;
    playerId: string;
    metric: string;
    mean?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<CampaignPlacing> {
    const { campaignId, playerId, metric, mean, dateFrom, dateTo } = args;
    return this.http.request<CampaignPlacing>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/report/campaign/placing/player/transport`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
          metric,
          mean,
          dateFrom,
          dateTo,
        }),
      }
    );
  }

  /**
   * getPlayerGameStats
   *
   * @param campaignId campaignId
   * @param groupMode groupMode
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getPlayerGameStatsUsingGET1(args: {
    campaignId: string;
    groupMode: string;
    dateFrom: string;
    dateTo: string;
  }): Observable<Array<GameStats>> {
    const { campaignId, groupMode, dateFrom, dateTo } = args;
    return this.http.request<Array<GameStats>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/player/game/stats`,
      {
        params: removeNullOrUndefined({
          campaignId,
          groupMode,
          dateFrom,
          dateTo,
        }),
      }
    );
  }

  /**
   * getPlayerStatus
   *
   */
  public getPlayerStatusUsingGET(): Observable<PlayerStatusReport> {
    return this.http.request<PlayerStatusReport>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/player/status`,
      {}
    );
  }

  /**
   * getPlayerTransportRecord
   *
   * @param campaignId campaignId
   * @param metric metric
   * @param groupMode groupMode
   * @param mean mean
   */
  public getPlayerTransportRecordUsingGET(args: {
    campaignId: string;
    metric: string;
    groupMode: string;
    mean?: string;
  }): Observable<Array<TransportStat>> {
    const { campaignId, metric, groupMode, mean } = args;
    return this.http.request<Array<TransportStat>>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/report/player/transport/record`,
      {
        params: removeNullOrUndefined({
          campaignId,
          metric,
          groupMode,
          mean,
        }),
      }
    );
  }

  /**
   * getPlayerTransportStats
   *
   * @param campaignId campaignId
   * @param metric metric
   * @param groupMode groupMode
   * @param mean mean
   * @param dateFrom yyyy-MM-dd
   * @param dateTo yyyy-MM-dd
   */
  public getPlayerTransportStatsUsingGET(args: {
    campaignId: string;
    metric: string;
    groupMode?: string;
    mean?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<Array<TransportStat>> {
    const { campaignId, metric, groupMode, mean, dateFrom, dateTo } = args;
    return this.http.request<Array<TransportStat>>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/report/player/transport/stats`,
      {
        params: removeNullOrUndefined({
          campaignId,
          metric,
          groupMode,
          mean,
          dateFrom,
          dateTo,
        }),
      }
    );
  }
}

function removeNullOrUndefined(obj: any) {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] != null) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}
