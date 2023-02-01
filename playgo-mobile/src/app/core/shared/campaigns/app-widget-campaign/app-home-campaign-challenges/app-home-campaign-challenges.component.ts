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
  public activeUncompleteChallenges$: Observable<Challenge[]>;
  activeUncompleteChallenges: Challenge[] = [];

  public futureChallenges$: Observable<Challenge[]>;
  subChallActive: Subscription;
  subChallFuture: Subscription;
  futureChallenges: Challenge[] = [];
  constructor(
    private challengeService: ChallengeService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.activeUncompleteChallenges$ =
      this.challengeService.getActiveUncompletedChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.subChallActive = this.activeUncompleteChallenges$.subscribe(
      (challenges) => {
        this.activeUncompleteChallenges = challenges;
      }
    );
    this.futureChallenges$ =
      this.challengeService.getFutureChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.subChallFuture = this.futureChallenges$.subscribe((challenges) => {
      this.futureChallenges = challenges;
    });
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
