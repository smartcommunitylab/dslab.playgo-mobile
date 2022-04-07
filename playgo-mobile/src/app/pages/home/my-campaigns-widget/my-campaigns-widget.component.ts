import { Component, Input, OnInit } from '@angular/core';
import { CampaignClass } from 'src/app/shared/campaigns/classes/campaign-class';

@Component({
  selector: 'app-my-campaigns-widget',
  templateUrl: './my-campaigns-widget.component.html',
  styleUrls: ['./my-campaigns-widget.component.scss'],
})
export class MyCampaignsWidgetComponent implements OnInit {

  @Input() campaigns: CampaignClass[];
  constructor() { }

  ngOnInit() {}

}
