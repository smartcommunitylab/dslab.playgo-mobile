import { Component, OnInit } from '@angular/core';
import { CampaignClass } from '../../../shared/campaigns/classes/campaign-class';
import { ContentPagable } from '../../../shared/campaigns/classes/content-pagable';
import { CampaignServiceService } from '../../../shared/service/campaign-service.service';

@Component({
  selector: 'app-my-campaign',
  templateUrl: './my-campaign.component.html',
  styleUrls: ['./my-campaign.component.scss'],
})
export class MyCampaignComponent implements OnInit {

  numberPage?: number;
  contentPagable?: ContentPagable;
  myCampaigns?: CampaignClass[];

  constructor(private myCampaignService :CampaignServiceService) {
   }

  ngOnInit() {
    if(!this.myCampaigns){
      this.numberPage = 0;
      this.myCampaignService.getPageNumberForMyCampaign(this.numberPage).subscribe((pagable) => {
        this.contentPagable = pagable;
        let list: CampaignClass[] = [];
        for (let campaign of pagable.content) {
          let cc: CampaignClass = campaign;
          list.push(cc);
        }
        this.myCampaigns = list;
      });
      this.numberPage++;
    }
  }

  joinCampaign(id: string){
    console.log("joining the campaign", id);
  }

  loadData(pagination){
    if(!this.contentPagable.last){
      console.log(this.numberPage);
      this.myCampaignService.getPageNumberForMyCampaign(this.numberPage).subscribe((pagable) => {
        this.contentPagable = pagable;
        for (let campaign of pagable.content) {
          let cc: CampaignClass = campaign;
          this.myCampaigns.push(cc);
        }
      });
      this.numberPage++;
    }
    pagination.target.complete();
  }

}
