import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CampaignClass } from '../classes/campaign-class';
import { CampaignCompany } from '../classes/campaign-company';
import { CampaignPersonal } from '../classes/campaign-personal';
import { CampaignSchool } from '../classes/campaign-school';
import { CampaignTerritory } from '../classes/campaign-territory';

@Component({
  selector: 'app-my-campaign-card',
  templateUrl: './my-campaign-card.component.html',
  styleUrls: ['./my-campaign-card.component.scss'],
})
export class MyCampaignCardComponent implements OnInit {
  @Input() containerCampaign: any; // CampaignClass | CampaignCompany | CampaignPersonal | CampaignSchool | CampaignTerritory;
  imagePath: SafeResourceUrl;

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.imagePath =
      'data:image/jpg;base64,' + this.containerCampaign.campaign.logo.image;
  }

  detailCampaign() {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/details/' +
        this.containerCampaign.campaign.campaignId
    );
  }

  joinCamp() {
    console.log('joinCampaign');
  }

  challenges() {
    console.log('challenges');
  }
}
