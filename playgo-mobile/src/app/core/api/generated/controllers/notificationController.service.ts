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
   * @param page Results page you want to retrieve (0..N)
   * @param size Number of records per page
   * @param territoryId territoryId
   * @param sort Sorting option: field,[asc,desc]
   * @param campaignId campaignId
   * @param channels channels
   */
  public getNotificationsUsingGET(args: {
    page: number;
    size: number;
    territoryId: string;
    sort?: string;
    campaignId?: string;
    channels?: string;
  }): Observable<PageAnnouncement> {
    const { page, size, territoryId, sort, campaignId, channels } = args;
    return this.http.request<PageAnnouncement>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/console/notifications/${encodeURIComponent(
          String(territoryId)
        )}`,
      {
        params: removeNullOrUndefined({
          page,
          size,
          sort,
          campaignId,
          channels,
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
  }): Observable<Announcement> {
    const { territoryId, body, campaignId } = args;
    return this.http.request<Announcement>(
      'post',
      environment.serverUrl.api +
        `/playandgo/api/console/notifications/${encodeURIComponent(
          String(territoryId)
        )}`,
      {
        body: body,
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
