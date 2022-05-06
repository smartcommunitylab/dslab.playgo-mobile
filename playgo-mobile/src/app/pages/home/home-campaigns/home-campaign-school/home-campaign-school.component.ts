import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-home-campaign-school',
  templateUrl: './home-campaign-school.component.html',
  styleUrls: ['./home-campaign-school.component.scss'],
})
export class HomeCampaignSchoolComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }
}
