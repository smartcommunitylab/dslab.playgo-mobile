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

  constructor() { }

  ngOnInit() {
    // console.log(this.status);
    // console.log(this.otherStatus);
  }
  getWidth(status: number) {
    if (this.challengeType === 'groupCompetitiveTime') {
      return `calc(${status / 2}% - 8px)`;
    }
    return `calc(${status}% - 8px)`;
  }
}
