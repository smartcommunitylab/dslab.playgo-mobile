import { Component, Input, OnInit } from '@angular/core';
import { Challenge } from '../challenges.page';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
})
export class ChallengeCardComponent implements OnInit {
  @Input() challenge: Challenge;
  constructor() {}

  ngOnInit() {}
}
