import { Component } from '@angular/core';

@Component({
  selector: 'app-campaigns',
  templateUrl: 'campaigns.page.html',
  styleUrls: ['campaigns.page.scss']
})
export class CampaignsPage {

  selectedSegment?:string;

  constructor() {}

  ngOnInit() {
    this.selectedSegment ='myCampaigns';
  }

}
