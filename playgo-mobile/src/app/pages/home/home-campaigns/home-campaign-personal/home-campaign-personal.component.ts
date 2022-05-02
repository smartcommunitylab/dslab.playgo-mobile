import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-campaign-personal',
  templateUrl: './home-campaign-personal.component.html',
  styleUrls: ['./home-campaign-personal.component.scss'],
})
export class HomeCampaignPersonalComponent implements OnInit, OnDestroy {
  @Input() campaign: any;
  constructor() { }

  ngOnInit() {

  }

  ngOnDestroy() {
  }
}
