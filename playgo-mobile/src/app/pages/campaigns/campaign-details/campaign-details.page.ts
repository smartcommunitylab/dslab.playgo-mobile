import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { CampaignClass } from '../../../core/shared/campaigns/classes/campaign-class';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit {
  id: string;
  campaign?: CampaignClass = new CampaignClass();

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    // private router: Router,
    private navCtrl: NavController
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.campaignService.getCampaignDetailsById(this.id).subscribe((result) => {
      this.campaign = result;
    });
  }
  getCampaign() {
    return JSON.stringify(this.campaign);
  }
  back() {
    this.navCtrl.back();
  }
  // backToCampaigns() {
  //   console.log('here');
  //   this.router.navigateByUrl('/tabs/campaigns');
  // }
}
