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
import { PlayerStatus } from '../model/playerStatus';
import { TransportStats } from '../model/transportStats';

@Injectable({
  providedIn: 'root',
})
export class ReportControllerService {
  constructor(private http: HttpClient) { }
  /**
   * getCampaingPlacingByCo2
   *
   * @param campaignId campaignId
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getCampaingPlacingByCo2UsingGET(
    campaignId: string,
    page?: number,
    size?: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<PageCampaignPlacing> {
    return this.http.request<PageCampaignPlacing>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/campaign/placing/co2`,
      {
        params: {
          campaignId,
          page,
          size,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getCampaingPlacingByGame
   *
   * @param campaignId campaignId
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getCampaingPlacingByGameUsingGET(
    campaignId: string,
    page?: number,
    size?: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<PageCampaignPlacing> {
    return this.http.request<PageCampaignPlacing>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/campaign/placing/game`,
      {
        params: {
          campaignId,
          page,
          size,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getCampaingPlacingByTransportMode
   *
   * @param campaignId campaignId
   * @param modeType modeType
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getCampaingPlacingByTransportModeUsingGET(
    campaignId: string,
    modeType: string,
    page?: number,
    size?: number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<PageCampaignPlacing> {
    return this.http.request<PageCampaignPlacing>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/report/campaign/placing/transport`,
      {
        params: {
          campaignId,
          page,
          size,
          modeType,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getPlayerCampaingPlacingByCo2
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getPlayerCampaingPlacingByCo2UsingGET(
    campaignId: string,
    playerId: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<CampaignPlacing> {
    return this.http.request<CampaignPlacing>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/report/campaign/placing/player/co2`,
      {
        params: {
          campaignId,
          playerId,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getPlayerCampaingPlacingByGame
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getPlayerCampaingPlacingByGameUsingGET(
    campaignId: string,
    playerId: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<CampaignPlacing> {
    return this.http.request<CampaignPlacing>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/report/campaign/placing/player/game`,
      {
        params: {
          campaignId,
          playerId,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getPlayerCampaingPlacingByTransportMode
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param modeType modeType
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   */
  public getPlayerCampaingPlacingByTransportModeUsingGET(
    campaignId: string,
    playerId: string,
    modeType: string,
    dateFrom?: string,
    dateTo?: string
  ): Observable<CampaignPlacing> {
    return this.http.request<CampaignPlacing>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/report/campaign/placing/player/transport`,
      {
        params: {
          campaignId,
          playerId,
          modeType,
          dateFrom,
          dateTo,
        },
      }
    );
  }

  /**
   * getPlayerGameStats
   *
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   * @param groupMode groupMode
   */
  public getPlayerGameStatsUsingGET(
    dateFrom: string,
    dateTo: string,
    groupMode: string
  ): Observable<Array<GameStats>> {
    return this.http.request<Array<GameStats>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/player/game/stats`,
      {
        params: {
          dateFrom,
          dateTo,
          groupMode,
        },
      }
    );
  }

  /**
   * getPlayerStatsu
   *
   */
  public getPlayerStatsuUsingGET(): Observable<PlayerStatus> {
    return this.http.request<PlayerStatus>(
      'get',
      environment.serverUrl.api + `/playandgo/api/report/player/status`,
      {}
    );
  }

  /**
   * getPlayerTransportStats
   *
   * @param dateFrom dateFrom
   * @param dateTo dateTo
   * @param groupMode groupMode
   */
  public getPlayerTransportStatsUsingGET(
    dateFrom?: string,
    dateTo?: string,
    groupMode?: string
  ): Observable<Array<TransportStats>> {
    return this.http.request<Array<TransportStats>>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/report/player/transport/stats`,
      {
        params: {
          dateFrom,
          dateTo,
          ...(groupMode && { groupMode }),
        },
      }
    );
  }
}
