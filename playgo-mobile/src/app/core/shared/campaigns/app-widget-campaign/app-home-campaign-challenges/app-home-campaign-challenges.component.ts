import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from 'src/app/pages/challenges/challenges.page';
import { ChallengeService } from '../../../services/challenge.service';

@Component({
  selector: 'app-home-campaign-challenges',
  templateUrl: './app-home-campaign-challenges.component.html',
  styleUrls: ['./app-home-campaign-challenges.component.scss'],
})
export class HomeCampaignChallengeComponent implements OnInit, OnDestroy {
  @Input() campaignContainer: PlayerCampaign;
  //unfinished challenge to show in the home
  public activeUncompleteChallenges$: Observable<Challenge[]>;
  //active challenges to show in the widget
  public activeChallenges$: Observable<Challenge[]>;
  //configurable challenges means choosable and possibility to send invites
  public configureChallenges$: Observable<Challenge[]>;
  //invites received
  public invitesChallenges$: Observable<Challenge[]>;

  subChallActive: Subscription;
  subChallFuture: Subscription;
  futureChallenges: Challenge[] = [];
  canInvite$: Observable<boolean>;
  constructor(
    private challengeService: ChallengeService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.activeUncompleteChallenges$ =
      this.challengeService.getActiveUncompletedChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.activeChallenges$ =
      this.challengeService.getActiveChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.configureChallenges$ =
      this.challengeService.configurableChallenges(
        this.campaignContainer?.campaign?.campaignId
      );
    this.canInvite$ = this.challengeService.canInviteByCampaign(
      this.campaignContainer?.campaign?.campaignId
    );
    this.invitesChallenges$ =
      this.challengeService.getInvitesChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
  }
  ngOnDestroy() {
    this.subChallActive.unsubscribe();
  }
  goToChallenge(event: Event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateRoot('/pages/tabs/challenges');
  }
}
