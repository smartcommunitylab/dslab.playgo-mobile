import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CampaignClass } from '../../../shared/campaigns/classes/campaign-class';
import { CampaignServiceService } from '../../../shared/service/campaign-service.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})

export class CampaignDetailsPage implements OnInit {

  id: string;
  campaign: CampaignClass;

  constructor(private route: ActivatedRoute,private campaignService: CampaignServiceService) {
    this.route.params.subscribe( params => this.id = params.id);
  }

  ngOnInit() {
    this.campaignService.getCampaignDetailsById(this.id).subscribe((result) => {
      console.log(result);
      this.campaign = result;
    });
  }

}
