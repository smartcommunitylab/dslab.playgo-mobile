import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaigns',
  templateUrl: 'campaigns.page.html',
  styleUrls: ['campaigns.page.scss'],
})
export class CampaignsPage implements OnInit {

  selectedSegment?: string;

  constructor() { }

  ngOnInit(): void {
    this.selectedSegment = 'myCampaigns';
  }
}
