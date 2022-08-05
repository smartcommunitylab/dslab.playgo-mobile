import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  public activeChallenges$: Observable<Challenge[]>;
  public futureChallenges$: Observable<Challenge[]>;
  subChallActive: Subscription;
  subChallFuture: Subscription;
  activeChallenges: Challenge[] = [];
  futureChallenges: Challenge[] = [];
  constructor(private challengeService: ChallengeService) {}

  ngOnInit() {
    this.activeChallenges$ =
      this.challengeService.getActiveChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.subChallActive = this.activeChallenges$.subscribe((challenges) => {
      this.activeChallenges = challenges;
    });
    this.futureChallenges$ =
      this.challengeService.getFutureChallengesByCampaign(
        this.campaignContainer?.campaign?.campaignId
      );
    this.subChallFuture = this.futureChallenges$.subscribe((challenges) => {
      this.futureChallenges = challenges;
    });
  }
  ngOnDestroy() {}
  goToChallenge(event: Event) {
    if (event && event.stopPropagation) {
      console.log('goToChallenge - stopPropagation');
      event.stopPropagation();
    }
    console.log('goToChallenge');
  }
}