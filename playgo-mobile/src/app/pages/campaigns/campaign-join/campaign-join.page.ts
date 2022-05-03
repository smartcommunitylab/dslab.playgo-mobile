import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-campaign-join',
  templateUrl: './campaign-join.page.html',
  styleUrls: ['./campaign-join.page.scss'],
})
export class CampaignJoinPage implements OnInit, OnDestroy {
  id: string;
  campaign?: Campaign;
  imagePath: SafeResourceUrl;
  sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    // private router: Router,
    private navCtrl: NavController
  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.sub = this.campaignService
      .getCampaignDetailsById(this.id)
      .subscribe((result) => {
        if (result) {
          this.campaign = result;
          this.imagePath = 'data:image/jpg;base64,' + this.campaign.logo.image;
        }
      });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  // getCampaign() {
  //   return JSON.stringify(this.campaign);
  // }
  joinCampaign(campaign) {
    this.sub = this.campaignService
      .subscribeToCampaign(campaign.campaignId)
      .subscribe((result) => {
        if (result) {
          console.log('subscribed');
          //TODO update page
        }
      });
  }
  back() {
    this.navCtrl.back();
  }
}
