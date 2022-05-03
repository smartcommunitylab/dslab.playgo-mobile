import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';

@Component({
  selector: 'app-campaign-details',
  templateUrl: './campaign-details.page.html',
  styleUrls: ['./campaign-details.page.scss'],
})
export class CampaignDetailsPage implements OnInit {
  id: string;
  campaign?: Campaign;
  imagePath: SafeResourceUrl;
  titlePage = '';

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private navCtrl: NavController,

  ) {
    this.route.params.subscribe((params) => (this.id = params.id));
  }

  ngOnInit() {
    this.campaignService.getCampaignDetailsById(this.id).subscribe((result) => {
      this.campaign = result;
      this.titlePage = this.campaign.name;
      this.imagePath =
        'data:image/jpg;base64,' + this.campaign.logo.image;
    });
  }
  getCampaign() {
    return JSON.stringify(this.campaign);
  }
  isPersonal() {
    return this.campaign.type === 'personal';
  }
  unsubscribeCampaign() {
    this.campaignService.unsubscribeCampaign(this.campaign.campaignId).subscribe((result) => {
      console.log(result);
    });
  }
}
