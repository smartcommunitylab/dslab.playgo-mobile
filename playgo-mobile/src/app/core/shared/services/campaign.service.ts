import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'ionic-appauth';
import { Observable, of, ReplaySubject, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CampaignControllerService } from '../../api/generated/controllers/campaignController.service';
import { Campaign } from '../../api/generated/model/campaign';
// import { Campaign } from '../../api/generated/model/campaign';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { CampaignClass } from '../campaigns/classes/campaign-class';
import { CampaignCompany } from '../campaigns/classes/campaign-company';
import { CampaignPersonal } from '../campaigns/classes/campaign-personal';
import { CampaignSchool } from '../campaigns/classes/campaign-school';
import { CampaignTerritory } from '../campaigns/classes/campaign-territory';
import { ContentPagable } from '../campaigns/classes/content-pagable';
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
    private http: HttpClient,
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

  getPageNumberForMyCampaign(pageNumber: number): Observable<ContentPagable> {
    // let pagableObj: Observable<ContentPagable>;
    const pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          const list: (
            | CampaignClass
            | CampaignCompany
            | CampaignSchool
            | CampaignPersonal
            | CampaignTerritory
          )[] = [];
          for (const campaign of obj.content) {
            const type = campaign.type;
            if (type === 'personal') {
              const cc: CampaignPersonal = campaign;
              list.push(cc);
            }
            if (type === 'school') {
              const cc: CampaignSchool = campaign;
              list.push(cc);
            }
            if (type === 'company') {
              const cc: CampaignCompany = campaign;
              list.push(cc);
            }
            if (type === 'territory') {
              const cc: CampaignTerritory = campaign;
              list.push(cc);
            }
          }
          obj.content = list;
          return obj;
        })
      );

    return pagableObj;
  }

  getPageNumberForAllCampaign(pageNumber: number): Observable<ContentPagable> {
    // let pagableObj: Observable<ContentPagable>;
    const pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          return obj;
        })
      );

    return pagableObj;
  }
  getCampaignDetailsById(
    id: string
  ): Observable<
    | CampaignClass
    | CampaignCompany
    | CampaignSchool
    | CampaignPersonal
    | CampaignTerritory
  > {
    return this.campaignControllerService.getCampaignUsingGET(id);
  }
  // getCampaignDetailsById(
  //   id: string
  // ): Observable<
  //   | CampaignClass
  //   | CampaignCompany
  //   | CampaignSchool
  //   | CampaignPersonal
  //   | CampaignTerritory
  // > {
  //   //let pagableObj: Observable<CampaignClass>;
  //   const pagableObj = this.http
  //     .get('assets/data/data.json', { responseType: 'text' })
  //     .pipe(
  //       map((response) => {
  //         const obj: ContentPagable = JSON.parse(response);
  //         const campaigns: CampaignClass[] = obj.content;
  //         for (const campaign of campaigns) {
  //           if (campaign.campaignId === id) {
  //             return campaign;
  //           }
  //         }
  //       })
  //     );
  //   return pagableObj;
  // }
}
