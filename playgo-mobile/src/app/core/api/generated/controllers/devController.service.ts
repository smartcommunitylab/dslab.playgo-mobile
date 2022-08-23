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

@Injectable({
  providedIn: 'root',
})
export class DevControllerService {
  constructor(private http: HttpClient) {}
  /**
   * addPlayers
   *
   */
  public addPlayersUsingPOST(): Observable<any> {
    return this.http.request<any>(
      'post',
      environment.serverUrl.api + `/playandgo/api/dev/players`,
      {}
    );
  }

  /**
   * addStats
   *
   */
  public addStatsUsingPOST(): Observable<any> {
    return this.http.request<any>(
      'post',
      environment.serverUrl.api + `/playandgo/api/dev/stats`,
      {}
    );
  }

  /**
   * addTracks
   *
   */
  public addTracksUsingPOST(): Observable<any> {
    return this.http.request<any>(
      'post',
      environment.serverUrl.api + `/playandgo/api/dev/tracks`,
      {}
    );
  }

  /**
   * getSurveyUrl
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param surveyName surveyName
   */
  public getSurveyUrlUsingGET(args: {
    campaignId: string;
    playerId: string;
    surveyName: string;
  }): Observable<string> {
    const { campaignId, playerId, surveyName } = args;
    return this.http.request<string>(
      'get',
      environment.serverUrl.api + `/playandgo/api/dev/survey/url`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
          surveyName,
        }),
      }
    );
  }

  /**
   * subscribeAziendale
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param companyKey companyKey
   * @param code code
   */
  public subscribeAziendaleUsingGET(args: {
    campaignId: string;
    playerId: string;
    companyKey: string;
    code: string;
  }): Observable<any> {
    const { campaignId, playerId, companyKey, code } = args;
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/dev/azienda/subscribe`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
          companyKey,
          code,
        }),
      }
    );
  }

  /**
   * testCampaignPlacingByTransportMode
   *
   */
  public testCampaignPlacingByTransportModeUsingGET(): Observable<any> {
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/dev/test/campaign/placing`,
      {}
    );
  }

  /**
   * unsubscribeAziendale
   *
   * @param campaignId campaignId
   * @param playerId playerId
   */
  public unsubscribeAziendaleUsingGET(args: {
    campaignId: string;
    playerId: string;
  }): Observable<any> {
    const { campaignId, playerId } = args;
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/dev/azienda/unsubscribe`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
        }),
      }
    );
  }

  /**
   * validateAziendale
   *
   * @param campaignId campaignId
   * @param playerId playerId
   * @param trackedInstanceId trackedInstanceId
   * @param campaignPlayerTrackId campaignPlayerTrackId
   */
  public validateAziendaleUsingGET(args: {
    campaignId: string;
    playerId: string;
    trackedInstanceId: string;
    campaignPlayerTrackId: string;
  }): Observable<any> {
    const { campaignId, playerId, trackedInstanceId, campaignPlayerTrackId } =
      args;
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/dev/azienda/validate`,
      {
        params: removeNullOrUndefined({
          campaignId,
          playerId,
          trackedInstanceId,
          campaignPlayerTrackId,
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
