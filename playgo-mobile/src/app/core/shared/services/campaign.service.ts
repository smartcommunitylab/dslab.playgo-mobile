import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
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
  private myCampaignsSubject = new ReplaySubject<PlayerCampaign[]>();
  public myCampaigns$: Observable<PlayerCampaign[]> =
    this.myCampaignsSubject.asObservable();
  private allCampaignsSubject = new ReplaySubject<Campaign[]>();
  public allCampaigns$: Observable<Campaign[]> =
    this.allCampaignsSubject.asObservable();
  constructor(
    private userService: UserService,
    private campaignControllerService: CampaignControllerService
  ) {
    this.userService.userProfile$.subscribe(async (profile) => {
      if (profile) {
        this.startService(profile);
      }
    });
  }
  async startService(profile: IUser) {
    this.getMyCampaigns().subscribe((myCampaigns) => {
      this.myCampaignsSubject.next(myCampaigns);
    });
    this.getAllCampaigns(profile).subscribe((allCampaigns) => {
      this.allCampaignsSubject.next(allCampaigns);
    });
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
  getCampaignDetailsById(id: string): Observable<Campaign> {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }
}
