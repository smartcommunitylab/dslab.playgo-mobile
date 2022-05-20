import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-campaign-card',
  templateUrl: './public-campaign-card.component.html',
  styleUrls: ['./public-campaign-card.component.scss'],
})
export class PublicCampaignCardComponent implements OnInit {
  @Input() campaign: any; // CampaignClass | CampaignCompany | CampaignPersonal | CampaignSchool | CampaignTerritory;
  imagePath: string;
  constructor(private router: Router) { }

  ngOnInit() {
    this.imagePath = this.campaign.logo.url ? this.campaign.logo.url :
      'data:image/jpg;base64,' + this.campaign.logo.image;
  }

  joinCamp() {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/join/' + this.campaign.campaignId
    );
  }
}
