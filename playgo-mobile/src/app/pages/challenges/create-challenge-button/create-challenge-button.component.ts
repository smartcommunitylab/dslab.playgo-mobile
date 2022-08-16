import { Component, Input, OnInit } from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-create-challenge-button',
  templateUrl: './create-challenge-button.component.html',
  styleUrls: ['./create-challenge-button.component.scss'],
})
export class CreateChallengeButtonComponent implements OnInit {
  @Input() campaign: PlayerCampaign;
  constructor() {}

  ngOnInit() {}
}
