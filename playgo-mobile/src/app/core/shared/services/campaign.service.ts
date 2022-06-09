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
  public playerCampaignsRefresher$ = new ReplaySubject<PlayerCampaign>(1);
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
    private campaignControllerService: CampaignControllerService
  ) {}
  subscribeToCampaign(id: string): Observable<CampaignSubscription> {
    //update my campaign list
    return this.campaignControllerService
      .subscribeCampaignUsingPOST({ campaignId: id })
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
}
