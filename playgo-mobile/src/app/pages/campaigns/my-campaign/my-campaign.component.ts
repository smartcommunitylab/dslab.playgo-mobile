import { Component, OnInit } from '@angular/core';
import { CampaignCompany } from 'src/app/core/shared/campaigns/classes/campaign-company';
import { CampaignPersonal } from 'src/app/core/shared/campaigns/classes/campaign-personal';
import { CampaignSchool } from 'src/app/core/shared/campaigns/classes/campaign-school';
import { CampaignTerritory } from 'src/app/core/shared/campaigns/classes/campaign-territory';
import { CampaignServiceService } from 'src/app/core/shared/services/campaign-service.service';
import { CampaignClass } from '../../../core/shared/campaigns/classes/campaign-class';
import { ContentPagable } from '../../../core/shared/campaigns/classes/content-pagable';

@Component({
  selector: 'app-my-campaign',
  templateUrl: './my-campaign.component.html',
  styleUrls: ['./my-campaign.component.scss'],
})
export class MyCampaignComponent implements OnInit {
  numberPage?: number;
  contentPagable?: ContentPagable;
  myCampaigns?: (
    | CampaignClass
    | CampaignCompany
    | CampaignPersonal
    | CampaignSchool
    | CampaignTerritory
  )[];

  constructor(private myCampaignService: CampaignServiceService) {}

  ngOnInit() {
    if (!this.myCampaigns) {
      this.numberPage = 0;
      this.myCampaignService
        .getPageNumberForMyCampaign(this.numberPage)
        .subscribe((pagable) => {
          this.contentPagable = pagable;
          this.myCampaigns = this.contentPagable.content;
        });
      this.numberPage++;
    }
  }

  joinCampaign(id: string) {
    console.log('joining the campaign', id);
  }

  loadData(pagination) {
    if (!this.contentPagable.last) {
      console.log(this.numberPage);
      this.myCampaignService
        .getPageNumberForMyCampaign(this.numberPage)
        .subscribe((pagable) => {
          this.contentPagable = pagable;
          for (const campaign of pagable.content) {
            const cc: CampaignClass = campaign;
            this.myCampaigns.push(cc);
          }
        });
      this.numberPage++;
    }
    pagination.target.complete();
  }
}