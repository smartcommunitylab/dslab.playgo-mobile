import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CampaignClass } from '../campaigns/classes/campaign-class';
import { ContentPagable } from '../campaigns/classes/content-pagable';

@Injectable({
  providedIn: 'root',
})
export class CampaignServiceService {


  constructor(private http: HttpClient) {}

  getMyCampaign(): Observable<any> {
    let listt: Observable<CampaignClass[]>;
    listt = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          let list: CampaignClass[] = [];
          for (let campaign of obj.content) {
            let cc: CampaignClass = campaign;
            list.push(cc);
          }
          return list;
        })
      );
    return listt;
  }

  getPageNumberForMyCampaign(pageNumber: number): Observable<ContentPagable> {
    let pagableObj: Observable<ContentPagable>;
    pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          return obj;
        })
      );

    return pagableObj;
  }


  getPageNumberForAllCampaign(pageNumber: number): Observable<ContentPagable> {
    let pagableObj: Observable<ContentPagable>;
    pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          return obj;
        })
      );

    return pagableObj;
  }

  getCampaignDetailsById(id:string): Observable<CampaignClass>{
    let pagableObj: Observable<CampaignClass>;
    pagableObj = this.http
      .get('assets/data/data.json', { responseType: 'text' })
      .pipe(
        map((response) => {
          const obj: ContentPagable = JSON.parse(response);
          let campaigns: CampaignClass[] = obj.content
          for(let campaign of campaigns){
            if(campaign.id ==id){
              return campaign;
            }
          }
        })
      );
    return pagableObj;
  }




}
