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

import { Announcement } from '../model/announcement';
import { PageAnnouncement } from '../model/pageAnnouncement';

@Injectable({
  providedIn: 'root',
})
export class NotificationControllerService {
  constructor(private http: HttpClient) {}
  /**
   * getNotifications
   *
   * @param territoryId territoryId
   * @param campaignId campaignId
   * @param skip skip
   * @param limit limit
   */
  public getNotificationsUsingGET(args: {
    territoryId: string;
    campaignId?: string;
    skip?: number;
    limit?: number;
  }): Observable<PageAnnouncement> {
    const { territoryId, campaignId, skip, limit } = args;
    return this.http.request<PageAnnouncement>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/console/notifications/${encodeURIComponent(
          String(territoryId)
        )}`,
      {
        params: removeNullOrUndefined({
          campaignId,
          skip,
          limit,
        }),
      }
    );
  }

  /**
   * notifyCampaign
   *
   * @param territoryId territoryId
   * @param body
   * @param campaignId campaignId
   */
  public notifyCampaignUsingPOST(args: {
    territoryId: string;
    body?: Announcement;
    campaignId?: string;
  }): Observable<{ [key: string]: string }> {
    const { territoryId, body, campaignId } = args;
    return this.http.request<{ [key: string]: string }>(
      'post',
      environment.serverUrl.api +
        `/playandgo/api/console/notifications/${encodeURIComponent(
          String(territoryId)
        )}`,
      {
        body,
        params: removeNullOrUndefined({
          campaignId,
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
