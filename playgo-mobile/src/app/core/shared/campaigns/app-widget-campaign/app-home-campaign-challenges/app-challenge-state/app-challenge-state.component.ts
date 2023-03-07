import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Challenge } from 'src/app/pages/challenges/challenges.page';

@Component({
  selector: 'app-challenge-state',
  templateUrl: './app-challenge-state.component.html',
  styleUrls: ['./app-challenge-state.component.scss'],
})
export class ChallengeStateComponent implements OnInit {
  @Input() activeChallenges$: Observable<Challenge[]>;
  @Input() configureChallenges$: Observable<Challenge[]>;
  @Input() invitesChallenges$: Observable<Challenge[]>;

  constructor() { }

  ngOnInit() { }

}
