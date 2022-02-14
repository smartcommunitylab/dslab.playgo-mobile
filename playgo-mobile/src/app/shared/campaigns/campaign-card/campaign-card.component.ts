import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignClass } from '../classes/campaign-class';

@Component({
  selector: 'app-campaign-card',
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.scss'],
})
export class CampaignCardComponent implements OnInit {

  @Input() join:boolean = false;
  @Input() campaign: CampaignClass;

  constructor(private router: Router) { }

  ngOnInit() {}

  detailCampaign(){
    this.router.navigateByUrl('/tabs/campaigns/details/'+this.campaign.id);
  }

  joinCamp(){
    console.log("joinCampaign");
  }

}
