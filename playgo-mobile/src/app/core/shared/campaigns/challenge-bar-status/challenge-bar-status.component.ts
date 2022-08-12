import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-challenge-bar-status',
  templateUrl: './challenge-bar-status.component.html',
  styleUrls: ['./challenge-bar-status.component.scss'],
})
export class ChallengeBarStatusComponent implements OnInit {
  @Input() status: number;
  @Input() rowStatus: number;
  @Input() otherStatus?: number;
  @Input() type: string;
  @Input() challengeType: string;
  // @Input() position?: string;

  constructor() {}

  ngOnInit() {
    console.log(this.otherStatus);
  }
  getWidth(status: number) {
    if (this.challengeType === 'groupCompetitiveTime') {
      return status / 2;
    }
    return status;
  }
  // getHeight() {
  //   if (this.position === 'home') {
  //     return '20';
  //   }
  //   return '30';
  // }
}
