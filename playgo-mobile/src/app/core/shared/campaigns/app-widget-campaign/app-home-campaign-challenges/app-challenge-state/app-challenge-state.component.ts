import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from 'src/app/pages/challenges/challenges.page';

@Component({
  selector: 'app-challenge-state',
  templateUrl: './app-challenge-state.component.html',
  styleUrls: ['./app-challenge-state.component.scss'],
})
export class ChallengeStateComponent implements OnInit {
  @Input() campaignContainer: PlayerCampaign;
  @Input() activeUncompleteChallenges$: Observable<Challenge[]>;
  @Input() configureChallenges$: Observable<Challenge[]>;
  @Input() invitesChallenges$: Observable<Challenge[]>;
  @Input() canInvite$: Observable<boolean>;

  constructor(private navController: NavController) { }

  ngOnInit() { }

  goToActiveChallenge(event: Event) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        selectedSegment: 'activeChallenges'
      }
    };
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateRoot('/pages/tabs/challenges', navigationExtras);
  }
  goToConfigureChallenge(event: Event) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        selectedSegment: 'futureChallenges'
      }
    };
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateRoot('/pages/tabs/challenges', navigationExtras);
  }
  goToInvitationsChallenge(event: Event) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        selectedSegment: 'futureChallenges'
      }
    };
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateRoot('/pages/tabs/challenges', navigationExtras);
  }
}
