import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignClass } from '../classes/campaign-class';
import { CampaignCompany } from '../classes/campaign-company';
import { CampaignPersonal } from '../classes/campaign-personal';
import { CampaignSchool } from '../classes/campaign-school';
import { CampaignTerritory } from '../classes/campaign-territory';

@Component({
  selector: 'app-campaign-card',
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.scss'],
})
export class CampaignCardComponent implements OnInit {
  @Input() join = false;
  @Input() campaign: any; // CampaignClass | CampaignCompany | CampaignPersonal | CampaignSchool | CampaignTerritory;

  constructor(private router: Router) {}

  ngOnInit() {}

  detailCampaign() {
    this.router.navigateByUrl(
      '/tabs/campaigns/details/' + this.campaign.campaignId
    );
  }

  joinCamp() {
    console.log('joinCampaign');
  }

  challenges() {
    console.log('challenges');
  }
}
