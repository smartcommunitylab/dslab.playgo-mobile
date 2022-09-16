import { Component, Input, OnInit } from '@angular/core';
import { PlayerGameStatus } from 'src/app/core/api/generated/model/playerGameStatus';

@Component({
  selector: 'app-game-status',
  templateUrl: './game-status.component.html',
  styleUrls: ['./game-status.component.scss'],
})
export class GameStatusComponent implements OnInit {
  @Input() status?: PlayerGameStatus = undefined;
  @Input() type?: string;
  constructor() {}

  ngOnInit() {
    // console.log(this.status);
    // console.log(
    //   (this.status?.score - this.status?.levels[0]?.startLevelScore) /
    //     (this.status?.levels[0]?.endLevelScore -
    //       this.status?.levels[0]?.startLevelScore)
    // );
  }
  getValueScore() {
    const score =
      (this.status?.score - this.status?.levels[0]?.startLevelScore) /
      (this.status?.levels[0]?.endLevelScore -
        this.status?.levels[0]?.startLevelScore);
    if (score > 0) {
      return score;
    } else {
      return 100;
    }
  }
}
