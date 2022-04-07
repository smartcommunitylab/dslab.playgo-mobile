import { Component, OnInit } from '@angular/core';
import { CampaignServiceService } from 'src/app/core/shared/services/campaign-service.service';
import { CampaignClass } from '../../../core/shared/campaigns/classes/campaign-class';
import { ContentPagable } from '../../../core/shared/campaigns/classes/content-pagable';

@Component({
  selector: 'app-all-campaign',
  templateUrl: './all-campaign.component.html',
  styleUrls: ['./all-campaign.component.scss'],
})
export class AllCampaignComponent implements OnInit {
  numberPage = 0;
  contentPagable?: ContentPagable;
  allCampaigns?: CampaignClass[];

  constructor(private campaignService: CampaignServiceService) {}

  ngOnInit() {
    this.campaignService
      .getPageNumberForAllCampaign(this.numberPage)
      .subscribe((result) => {
        this.contentPagable = result;
        this.allCampaigns = result.content;
      });
    this.numberPage++;
  }

  joinCampaign(id: string) {
    console.log('joining the campaign', id);
  }

  loadData(event) {
    if (!this.contentPagable.last) {
      this.campaignService
        .getPageNumberForAllCampaign(this.numberPage)
        .subscribe((pagable) => {
          this.contentPagable = pagable;
          for (const campaign of pagable.content) {
            const cc: CampaignClass = campaign;
            this.allCampaigns.push(cc);
          }
        });
      this.numberPage++;
    }
    event.target.complete();
  }
}
