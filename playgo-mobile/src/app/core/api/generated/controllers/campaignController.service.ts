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

import { Campaign } from '../model/campaign';
import { CampaignInfo } from '../model/campaignInfo';
import { CampaignSubscription } from '../model/campaignSubscription';
import { CampaignWebhook } from '../model/campaignWebhook';
import { Image } from '../model/image';
import { PlayerCampaign } from '../model/playerCampaign';
import { SurveyRequest } from '../model/surveyRequest';

@Injectable({
  providedIn: 'root',
})
export class CampaignControllerService {
  constructor(private http: HttpClient) { }
  /**
   * addCampaign
   *
   * @param body
   */
  public addCampaignUsingPOST(body?: Campaign): Observable<Campaign> {
    return this.http.request<Campaign>(
      'post',
      environment.serverUrl.api + `/playandgo/api/campaign`,
      {
        body,
      }
    );
  }

  /**
   * addSurvey
   *
   * @param campaignId campaignId
   * @param body
   */
  public addSurveyUsingPOST(args: {
    campaignId: string;
    body?: SurveyRequest;
  }): Observable<Array<SurveyRequest>> {
    const { campaignId, body } = args;
    return this.http.request<Array<SurveyRequest>>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/survey`,
      {
        body,
      }
    );
  }

  /**
   * deleteCampaign
   *
   * @param campaignId campaignId
   */
  public deleteCampaignUsingDELETE(campaignId: string): Observable<Campaign> {
    return this.http.request<Campaign>(
      'delete',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(String(campaignId))}`,
      {}
    );
  }

  /**
   * deleteSurvey
   *
   * @param campaignId campaignId
   * @param name name
   */
  public deleteSurveyUsingDELETE(args: {
    campaignId: string;
    name: string;
  }): Observable<Array<SurveyRequest>> {
    const { campaignId, name } = args;
    return this.http.request<Array<SurveyRequest>>(
      'delete',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/survey`,
      {
        params: removeNullOrUndefined({
          name,
        }),
      }
    );
  }

  /**
   * deleteWebhook
   *
   * @param campaignId campaignId
   */
  public deleteWebhookUsingDELETE(campaignId: string): Observable<any> {
    return this.http.request<any>(
      'delete',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/webhook`,
      {}
    );
  }

  /**
   * getCampaign
   *
   * @param campaignId campaignId
   */
  public getCampaignUsingGET(campaignId: string): Observable<Campaign> {
    return this.http.request<Campaign>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(String(campaignId))}`,
      {}
    );
  }

  /**
   * getCampaignsByPlayer
   *
   * @param playerId playerId
   */
  public getCampaignsByPlayerUsingGET(
    playerId: string
  ): Observable<Array<CampaignInfo>> {
    return this.http.request<Array<CampaignInfo>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/campaign/player`,
      {
        params: removeNullOrUndefined({
          playerId,
        }),
      }
    );
  }

  /**
   * getCampaigns
   *
   * @param territoryId territoryId
   * @param type type
   * @param currentlyActive currentlyActive
   * @param onlyVisible onlyVisible
   */
  public getCampaignsUsingGET(args: {
    territoryId: string;
    type?: string;
    currentlyActive?: boolean;
    onlyVisible?: boolean;
  }): Observable<Array<Campaign>> {
    const { territoryId, type, currentlyActive, onlyVisible } = args;
    return this.http.request<Array<Campaign>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/campaign`,
      {
        params: removeNullOrUndefined({
          territoryId,
          type,
          currentlyActive,
          onlyVisible,
        }),
      }
    );
  }

  /**
   * getMyCampaigns
   *
   * @param currentlyActive currentlyActive
   * @param onlyVisible onlyVisible
   */
  public getMyCampaignsUsingGET(args: {
    currentlyActive?: boolean;
    onlyVisible?: boolean;
  }): Observable<Array<PlayerCampaign>> {
    const { currentlyActive, onlyVisible } = args;
    return this.http.request<Array<PlayerCampaign>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/campaign/my`,
      {
        params: removeNullOrUndefined({
          currentlyActive,
          onlyVisible,
        }),
      }
    );
  }

  /**
   * getWebhook
   *
   * @param campaignId campaignId
   */
  public getWebhookUsingGET(campaignId: string): Observable<CampaignWebhook> {
    return this.http.request<CampaignWebhook>(
      'get',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/webhook`,
      {}
    );
  }

  /**
   * setWebhook
   *
   * @param campaignId campaignId
   * @param body
   */
  public setWebhookUsingPOST(args: {
    campaignId: string;
    body?: CampaignWebhook;
  }): Observable<CampaignWebhook> {
    const { campaignId, body } = args;
    return this.http.request<CampaignWebhook>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/webhook`,
      {
        body,
      }
    );
  }

  /**
   * subscribeCampaign
   *
   * @param campaignId campaignId
   * @param body
   */
  public subscribeCampaignUsingPOST(args: {
    campaignId: string;
    body?: any;
  }): Observable<CampaignSubscription> {
    const { campaignId, body } = args;
    return this.http.request<CampaignSubscription>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/subscribe`,
      {
        body,
      }
    );
  }

  /**
   * unsubscribeCampaign
   *
   * @param campaignId campaignId
   */
  public unsubscribeCampaignUsingPUT(
    campaignId: string
  ): Observable<CampaignSubscription> {
    return this.http.request<CampaignSubscription>(
      'put',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/unsubscribe`,
      {}
    );
  }

  /**
   * updateCampaign
   *
   * @param body
   */
  public updateCampaignUsingPUT(body?: Campaign): Observable<any> {
    return this.http.request<any>(
      'put',
      environment.serverUrl.api + `/playandgo/api/campaign`,
      {
        body,
      }
    );
  }

  /**
   * uploadCampaignBanner
   *
   * @param campaignId campaignId
   * @param body
   */
  public uploadCampaignBannerUsingPOST(args: {
    campaignId: string;
    body?: Object;
  }): Observable<Image> {
    const { campaignId, body } = args;
    return this.http.request<Image>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/banner`,
      {
        body,
      }
    );
  }

  /**
   * uploadCampaignLogo
   *
   * @param campaignId campaignId
   * @param body
   */
  public uploadCampaignLogoUsingPOST(args: {
    campaignId: string;
    body?: Object;
  }): Observable<Image> {
    const { campaignId, body } = args;
    return this.http.request<Image>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/logo`,
      {
        body,
      }
    );
  }

  /**
   * uploadRewards
   *
   * @param campaignId campaignId
   * @param body
   */
  public uploadRewardsUsingPOST(args: {
    campaignId: string;
    body?: Object;
  }): Observable<Array<string>> {
    const { campaignId, body } = args;
    return this.http.request<Array<string>>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/reward`,
      {
        body,
      }
    );
  }

  /**
   * uploadWeekConfs
   *
   * @param campaignId campaignId
   * @param body
   */
  public uploadWeekConfsUsingPOST(args: {
    campaignId: string;
    body?: Object;
  }): Observable<Array<string>> {
    const { campaignId, body } = args;
    return this.http.request<Array<string>>(
      'post',
      environment.serverUrl.api +
      `/playandgo/api/campaign/${encodeURIComponent(
        String(campaignId)
      )}/weekconf`,
      {
        body,
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
