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

import { Avatar } from '../model/avatar';
import { Player } from '../model/player';
import { PlayerInfo } from '../model/playerInfo';

@Injectable({
  providedIn: 'root',
})
export class PlayerControllerService {
  constructor(private http: HttpClient) {}
  /**
   * addPlayer
   *
   * @param body
   */
  public addPlayerUsingPOST(body?: Player): Observable<Player> {
    return this.http.request<Player>(
      'post',
      environment.serverUrl.api + `/playandgo/api/player`,
      {
        body,
      }
    );
  }

  /**
   * checkNickname
   *
   * @param nickname nickname
   */
  public checkNicknameUsingGET(nickname: string): Observable<boolean> {
    return this.http.request<boolean>(
      'get',
      environment.serverUrl.api + `/playandgo/api/player/nick`,
      {
        params: {
          nickname,
        },
      }
    );
  }

  /**
   * deletePlayer
   *
   * @param playerId playerId
   */
  public deletePlayerUsingDELETE(playerId: string): Observable<Player> {
    return this.http.request<Player>(
      'delete',
      environment.serverUrl.api +
        `/playandgo/api/player/${encodeURIComponent(String(playerId))}`,
      {}
    );
  }

  /**
   * getPlayerAvatarDataSmall
   *
   */
  public getPlayerAvatarDataSmallUsingGET(): Observable<any> {
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/player/avatar/small`,
      {}
    );
  }

  /**
   * getPlayerAvatarData
   *
   */
  public getPlayerAvatarDataUsingGET(): Observable<any> {
    return this.http.request<any>(
      'get',
      environment.serverUrl.api + `/playandgo/api/player/avatar`,
      {}
    );
  }

  /**
   * getPlayer
   *
   * @param playerId playerId
   */
  public getPlayerUsingGET(playerId: string): Observable<Player> {
    return this.http.request<Player>(
      'get',
      environment.serverUrl.api +
        `/playandgo/api/player/${encodeURIComponent(String(playerId))}`,
      {}
    );
  }

  /**
   * getProfile
   *
   */
  public getProfileUsingGET(): Observable<Player> {
    return this.http.request<Player>(
      'get',
      environment.serverUrl.api + `/playandgo/api/player/profile`,
      {}
    );
  }

  /**
   * registerPlayer
   *
   * @param body
   */
  public registerPlayerUsingPOST(body?: Player): Observable<Player> {
    return this.http.request<Player>(
      'post',
      environment.serverUrl.api + `/playandgo/api/player/register`,
      {
        body,
      }
    );
  }

  /**
   * searchNickname
   *
   * @param nickname nickname
   */
  public searchNicknameUsingGET(
    nickname: string
  ): Observable<Array<PlayerInfo>> {
    return this.http.request<Array<PlayerInfo>>(
      'get',
      environment.serverUrl.api + `/playandgo/api/player/search`,
      {
        params: {
          nickname,
        },
      }
    );
  }

  /**
   * updateProfile
   *
   * @param body
   */
  public updateProfileUsingPUT(body?: Player): Observable<Player> {
    return this.http.request<Player>(
      'put',
      environment.serverUrl.api + `/playandgo/api/player/profile`,
      {
        body,
      }
    );
  }

  /**
   * uploadPlayerAvatar
   *
   * @param body
   */
  public uploadPlayerAvatarUsingPOST(body?: Object): Observable<Avatar> {
    return this.http.request<Avatar>(
      'post',
      environment.serverUrl.api + `/playandgo/api/player/avatar`,
      {
        body,
      }
    );
  }
}
