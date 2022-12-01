import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CampaignPlacing as PlayerCampaignPlacing } from 'src/app/core/api/generated/model/campaignPlacing';


@Component({
  selector: 'app-home-user-profile',
  templateUrl: './home-user-profile.component.html',
  styleUrls: ['./home-user-profile.component.scss'],
})
export class HomeUserProfiloComponent implements OnInit, OnDestroy {
  @Input() reportWeekStat: PlayerCampaignPlacing;

  constructor(

  ) { }

  ngOnInit() {

  }
  goToChallenge(event: Event) {

  }

  ngOnDestroy() {
  }
}
