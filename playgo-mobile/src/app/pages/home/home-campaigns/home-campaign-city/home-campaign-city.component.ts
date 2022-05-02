import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-campaign-city',
  templateUrl: './home-campaign-city.component.html',
  styleUrls: ['./home-campaign-city.component.scss'],
})
export class HomeCampaignCityComponent implements OnInit, OnDestroy {
  @Input() campaign: any;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {}
}
