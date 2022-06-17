import { Component, Input, OnInit } from '@angular/core';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';

@Component({
  selector: 'app-leaderboard-status',
  templateUrl: './leaderboard-status.component.html',
  styleUrls: ['./leaderboard-status.component.scss'],
})
export class LeaderboardStatusComponent implements OnInit {
  @Input() leaderboard?: any = undefined;
  @Input() type?: string;
  constructor() {}

  ngOnInit() {
    console.log(this.leaderboard);
  }
}
