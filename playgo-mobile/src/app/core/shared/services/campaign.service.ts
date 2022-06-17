import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, Observable, ReplaySubject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CampaignControllerService } from '../../api/generated/controllers/campaignController.service';
import { Campaign } from '../../api/generated/model/campaign';
import { CampaignSubscription } from '../../api/generated/model/campaignSubscription';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { IUser } from '../model/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  public initMyCampaigns$: Observable<PlayerCampaign[]> =
    this.userService.userProfile$.pipe(
      filter((profile) => profile !== null),
      first(),
      switchMap(() => this.campaignControllerService.getMyCampaignsUsingGET()),
      shareReplay(1)
    );

  public allCampaigns$: Observable<Campaign[]> =
    this.userService.userProfile$.pipe(
      map((profile) => profile.territoryId),
      first(),
      switchMap((territoryId) =>
        this.campaignControllerService.getCampaignsUsingGET({ territoryId })
      ),
      shareReplay(1)
    );
  private playerCampaignUnSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  private playerCampaignSubscribed$ = new ReplaySubject<PlayerCampaign>(1);
  public playerCampaignsRefresher$ = new ReplaySubject<void>(1);
  private campaignsCouldBeChanged$ = merge(
    this.initMyCampaigns$,
    this.playerCampaignSubscribed$,
    this.playerCampaignUnSubscribed$,
    this.playerCampaignsRefresher$
  ).pipe(startWith(null));

  myCampaigns$ = this.campaignsCouldBeChanged$.pipe(
    switchMap(() => this.campaignControllerService.getMyCampaignsUsingGET()),
    shareReplay(1)
  );

  constructor(
    private userService: UserService,
    private campaignControllerService: CampaignControllerService,
    private http: HttpClient
  ) {}
  subscribeToCampaign(
    id: string,
    body?: any
  ): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService
      .subscribeCampaignUsingPOST({ campaignId: id, body })
      .pipe(
        map((res) => {
          this.playerCampaignSubscribed$.next(null);
          return res;
        })
      );
  }
  unsubscribeCampaign(id: string): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService.unsubscribeCampaignUsingPUT(id).pipe(
      map((res) => {
        this.playerCampaignUnSubscribed$.next(null);
        return res;
      })
    );
  }
  getCampaignDetailsById(id: string): Observable<Campaign> {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }

  getCompaniesForSubscription(
    campaignId: string
  ): Observable<CampaignSubscription> {
    return this.http.request<CampaignSubscription>(
      'get',
      environment.serverUrl.pgaziendeUrl +
        `/campaigns/${encodeURIComponent(String(campaignId))}/companies`,
      {}
    );
  }

  /** returns ionic "color". For example "danger" */
  getCampaignColor(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    return campaign.type;
  }
  /** returns app icon name. For example "leaf" */
  getCampaignTypeIcon(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'flower';
    }
    if (campaign.type === 'company') {
      return 'co2';
    }
    if (campaign.type === 'school') {
      return 'shield';
    }
    if (campaign.type === 'personal') {
      return 'co2';
    }
  }

  /** returns app-icon name. For example "flower" */
  getCampaignScoreIcon(campaign: Campaign): string {
    if (!campaign) {
      return null;
    }
    if (campaign.type === 'city') {
      return 'flower';
    }
    if (campaign.type === 'company') {
      return null;
    }
    if (campaign.type === 'school') {
      return 'shield';
    }
    if (campaign.type === 'personal') {
      return null;
    }
  }
}
