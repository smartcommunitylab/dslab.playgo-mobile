import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { CampaignClass } from '../../../core/shared/campaigns/classes/campaign-class';
import { ContentPagable } from '../../../core/shared/campaigns/classes/content-pagable';

@Component({
  selector: 'app-all-campaign',
  templateUrl: './all-campaign.component.html',
  styleUrls: ['./all-campaign.component.scss'],
})
export class AllCampaignComponent implements OnInit, OnDestroy {
  numberPage = 0;
  contentPagable?: ContentPagable;
  allOthersCampaigns?: CampaignClass[];
  allCampaigns?: CampaignClass[];
  sub: any;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.sub = combineLatest(
      this.campaignService.myCampaigns$,
      this.campaignService.allCampaigns$,
      (my, all) => ({ my, all })
    ).subscribe((pair) => {
      this.allCampaigns = pair.all.filter(
        (allCampaign) =>
          !pair.my.find(
            (myCampaign) =>
              allCampaign.campaignId === myCampaign.campaign.campaignId
          )
      );
    });

    // this.campaignService
    //   .getPageNumberForAllCampaign(this.numberPage)
    //   .subscribe((result) => {
    //     this.contentPagable = result;
    //     this.allCampaigns = result.content;
    //   });
    // this.numberPage++;
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
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
