import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss'],
})
export class CampaignComponent implements OnInit {

  selectedSegment?:string;

  constructor( private translate: TranslateService) { }

  ngOnInit() {
    this.selectedSegment ='myCampaigns';
  }

}
