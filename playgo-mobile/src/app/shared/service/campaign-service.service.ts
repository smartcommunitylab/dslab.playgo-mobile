import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CampaignClass } from '../campaigns/classes/campaign-class';
import { CampaignCompany } from '../campaigns/classes/campaign-company';
import { CampaignPersonal } from '../campaigns/classes/campaign-personal';
import { CampaignSchool } from '../campaigns/classes/campaign-school';
import { CampaignTerritory } from '../campaigns/classes/campaign-territory';
import { ContentPagable } from '../campaigns/classes/content-pagable';

@Injectable({
  providedIn: 'root',
})
export class CampaignServiceService {


  constructor(private http: HttpClient) {}

  getMyCampaign(): Observable<any> {
    //let listt: Observable<CampaignClass[]>;
    const listt = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          const list: CampaignClass[] = [];
          for (const campaign of obj.content) {
            const cc: CampaignClass = campaign;
            list.push(cc);
          }
          return list;
        })
      );
    return listt;
  }

  getPageNumberForMyCampaign(pageNumber: number): Observable<ContentPagable> {
    // let pagableObj: Observable<ContentPagable>;
    const pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          const list: (CampaignClass | CampaignCompany | CampaignSchool | CampaignPersonal | CampaignTerritory)[] = [];
          for (const campaign of obj.content) {
            const type = campaign.type;
            if(type === 'personal'){
              const cc: CampaignPersonal = campaign;
              list.push(cc);
            }
            if(type === 'school'){
              const cc: CampaignSchool = campaign;
              list.push(cc);
            }
            if(type === 'company'){
              const cc: CampaignCompany = campaign;
              list.push(cc);
            }
            if(type === 'territory'){
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

  getCampaignDetailsById(id: string): Observable<CampaignClass | CampaignCompany | CampaignSchool | CampaignPersonal | CampaignTerritory>{
    //let pagableObj: Observable<CampaignClass>;
    const pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          const campaigns: CampaignClass[] = obj.content;
          for(const campaign of campaigns){
            if(campaign.campaignId === id){
              return campaign;
            }
          }
        })
      );
    return pagableObj;
  }




}
