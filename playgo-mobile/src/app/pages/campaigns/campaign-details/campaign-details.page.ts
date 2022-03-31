import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { CampaignClass } from '../../../shared/campaigns/classes/campaign-class';
import { CampaignServiceService } from '../../../shared/service/campaign-service.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})

export class CampaignDetailsPage implements OnInit {
  id: string;
  campaign?: CampaignClass = new CampaignClass();

  constructor(private route: ActivatedRoute,private campaignService: CampaignServiceService,private router: Router) {
    this.route.params.subscribe( params => this.id = params.id);
  }

  ngOnInit() {
    this.campaignService.getCampaignDetailsById(this.id).subscribe((result) => {
      this.campaign = result;
    });
  }

  backToCampaigns(){
    console.log('here');
    this.router.navigateByUrl('/tabs/campaigns');
  }

}
