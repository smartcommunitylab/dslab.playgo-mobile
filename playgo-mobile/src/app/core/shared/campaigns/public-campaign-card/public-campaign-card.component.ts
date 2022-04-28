import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CampaignClass } from '../classes/campaign-class';
import { CampaignCompany } from '../classes/campaign-company';
import { CampaignPersonal } from '../classes/campaign-personal';
import { CampaignSchool } from '../classes/campaign-school';
import { CampaignTerritory } from '../classes/campaign-territory';

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
    this.imagePath = 'data:image/jpg;base64,' + this.campaign.logo.image;
  }


  joinCamp() {
    this.router.navigateByUrl(
      '/pages/tabs/campaigns/join/' + this.campaign.campaignId
    );
  }
}
