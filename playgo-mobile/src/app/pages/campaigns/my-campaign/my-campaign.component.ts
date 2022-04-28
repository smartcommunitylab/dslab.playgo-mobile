import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignCompany } from 'src/app/core/shared/campaigns/classes/campaign-company';
import { CampaignPersonal } from 'src/app/core/shared/campaigns/classes/campaign-personal';
import { CampaignSchool } from 'src/app/core/shared/campaigns/classes/campaign-school';
import { CampaignTerritory } from 'src/app/core/shared/campaigns/classes/campaign-territory';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { CampaignClass } from '../../../core/shared/campaigns/classes/campaign-class';
import { ContentPagable } from '../../../core/shared/campaigns/classes/content-pagable';

@Component({
  selector: 'app-my-campaign',
  templateUrl: './my-campaign.component.html',
  styleUrls: ['./my-campaign.component.scss'],
})
export class MyCampaignComponent implements OnInit, OnDestroy {
  numberPage?: number;
  contentPagable?: ContentPagable;
  myCampaigns?: //todo conversions
    (
      | CampaignClass
      | CampaignCompany
      | CampaignPersonal
      | CampaignSchool
      | CampaignTerritory
      | PlayerCampaign
    )[];
  sub: Subscription;

  constructor(private campaignService: CampaignService) { }

  ngOnInit() {
    this.sub = this.campaignService.myCampaigns$.subscribe((campaigns) => {
      this.myCampaigns = campaigns;
    });
    // if (!this.myCampaigns) {
    //   this.numberPage = 0;
    //   this.myCampaignService
    //     .getPageNumberForMyCampaign(this.numberPage)
    //     .subscribe((pagable) => {
    //       this.contentPagable = pagable;
    //       this.myCampaigns = this.contentPagable.content;
    //     });
    //   this.numberPage++;
    // }
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  joinCampaign(id: string) {
    console.log('joining the campaign', id);
  }

  loadData(pagination) {
    if (!this.contentPagable.last) {
      console.log(this.numberPage);
      this.campaignService
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
