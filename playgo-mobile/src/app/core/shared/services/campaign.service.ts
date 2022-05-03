import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, first, map, shareReplay, switchMap } from 'rxjs/operators';
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
  public myCampaigns$: Observable<PlayerCampaign[]> =
    this.userService.userProfile$.pipe(
      filter((profile) => profile !== null),
      first(),
      switchMap(() => this.campaignControllerService.getMyCampaignsUsingGET()),
      shareReplay()
    );

  public allCampaigns$: Observable<Campaign[]> =
    this.userService.userProfile$.pipe(
      map((profile) => profile.territoryId),
      first(),
      switchMap((territoryId) =>
        this.campaignControllerService.getCampaignsUsingGET(territoryId)
      ),
      shareReplay()
    );
  constructor(
    private userService: UserService,
    private campaignControllerService: CampaignControllerService
  ) {
  }

  getMyCampaigns(): Observable<PlayerCampaign[]> {
    return this.campaignControllerService.getMyCampaignsUsingGET();
  }
  getAllCampaigns(profile: IUser): Observable<Campaign[]> {
    return this.campaignControllerService.getCampaignsUsingGET(
      profile.territoryId
    );
  }
  subscribeToCampaign(id: string): Observable<CampaignSubscription> {
    return this.campaignControllerService.subscribeCampaignUsingPOST(id);
  }
  unsubscribeCampaign(id: string): Observable<CampaignSubscription> {
    return this.campaignControllerService.unsubscribeCampaignUsingPUT(id);
  }
  getCampaignDetailsById(id: string): Observable<Campaign> {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }
}
