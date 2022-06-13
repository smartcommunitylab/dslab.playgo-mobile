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

import { CampaignSubscription } from '../model/campaignSubscription';
import { PagePlayerInfo } from '../model/pagePlayerInfo';

@Injectable({
  providedIn: 'root',
})
export class ExternalControllerService {
  constructor(private http: HttpClient) {}
  /**
   * getCampaignPlacing
   *
   * @param campaignId campaignId
   * @param body
   */
  public getCampaignPlacingUsingPOST(args: {
    campaignId: string;
    body?: Array<string>;
  }): Observable<{ [key: string]: number }> {
    const { campaignId, body } = args;
    return this.http.request<{ [key: string]: number }>(
      'post',
      environment.serverUrl.api + `/playandgo/api/ext/campaign/game/placing`,
      {
        body,
        params: removeNullOrUndefined({
          campaignId,
        }),
      }
    );
  }

  /**
   * searchPlayers
   *
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param territory territory
   * @param sort Sorting option: field,[asc,desc]
   * @param txt txt
   */
  public searchPlayersUsingGET(args: {
    page: number;
    size: number;
    territory: string;
    sort?: string;
    txt?: string;
  }): Observable<PagePlayerInfo> {
    const { page, size, territory, sort, txt } = args;
    return this.http.request<PagePlayerInfo>(
      'get',
      environment.serverUrl.api + `/playandgo/api/ext/territory/players`,
      {
        params: removeNullOrUndefined({
          page,
          size,
          sort,
          txt,
          territory,
        }),
      }
    );
  }

  /**
   * subscribeCampaignByTerritory
   *
   * @param campaignId campaignId
   * @param nickname nickname
   * @param body
   */
  public subscribeCampaignByTerritoryUsingPOST(args: {
    campaignId: string;
    nickname: string;
    body?: any;
  }): Observable<CampaignSubscription> {
    const { campaignId, nickname, body } = args;
    return this.http.request<CampaignSubscription>(
      'post',
      environment.serverUrl.api +
        `/playandgo/api/ext/campaign/subscribe/territory`,
      {
        body,
        params: removeNullOrUndefined({
          campaignId,
          nickname,
        }),
      }
    );
  }

  /**
   * unsubscribeCampaignByTerritory
   *
   * @param campaignId campaignId
   * @param nickname nickname
   */
  public unsubscribeCampaignByTerritoryUsingDELETE(args: {
    campaignId: string;
    nickname: string;
  }): Observable<CampaignSubscription> {
    const { campaignId, nickname } = args;
    return this.http.request<CampaignSubscription>(
      'delete',
      environment.serverUrl.api +
        `/playandgo/api/ext/campaign/unsubscribe/territory`,
      {
        params: removeNullOrUndefined({
          campaignId,
          nickname,
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
