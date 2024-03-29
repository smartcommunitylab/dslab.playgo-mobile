import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ModalController, NavController } from '@ionic/angular';
import { combineLatest, Observable, of, Subscription, switchMap } from 'rxjs';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { InfoChallengeSingleModalPage } from './info-challenge-single-modal/info-challenge-single.modal';
import { InfoChallengeGroupModalPage } from './info-challenge-group-modal/info-challenge-group.modal';
import { getImgChallenge } from 'src/app/core/shared/campaigns/campaign.utils';

@Component({
  selector: 'app-challenges-proposed-card',
  templateUrl: './challenges-proposed-card.component.html',
  styleUrls: ['./challenges-proposed-card.component.scss'],
})
export class ChallengesProposedCardComponent implements OnInit, OnChanges {
  @Input() challenges: Challenge[] = [];
  @Input() campaign: PlayerCampaign;
  @Input() type: string;
  @Input() canInvite: boolean;
  imgChallenge = getImgChallenge;
  singleChallenges: Challenge[] = [];
  coupleChallenges: any[] = [];
  sentInvitation$: Observable<boolean>;
  constructor(
    public campaignService: CampaignService,
    private navCtrl: NavController,
    public challengeService: ChallengeService,
    private userService: UserService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.sentInvitation$ = combineLatest([
      this.userService.userProfile$,
      this.challengeService.futureChallenges$,
      this.challengeService.futureChallengesTeam$,
    ]).pipe(
      switchMap(([profile, challenges, challengesTeam]) => {
        if (challenges.some((chall) => chall.proposerId === profile.playerId) ||
          challengesTeam.some((chall) => chall.proposerId === profile.playerId)) {
          return of(true);
        }
        return of(false);
      })
    );
  }
  ngOnChanges() {
    // console.log(this.canInvite);
    this.singleChallenges = this.challenges?.filter(
      (challenge) => challenge.otherAttendeeData == null
    );
    this.coupleChallenges = this.challenges?.filter(
      (challenge) => challenge.otherAttendeeData != null
    );
  }
  goToCreateChallenge(event: Event, campaign: PlayerCampaign) {
    this.navCtrl.navigateRoot(
      `/pages/tabs/challenges/create-challenge/${campaign.campaign.campaignId}`
    );
  }
  async openInfoChallengeSingle() {
    const modal = await this.modalController.create({
      component: InfoChallengeSingleModalPage,
      cssClass: 'modal-challenge',
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
  async openInfoChallengeGroup() {
    const modal = await this.modalController.create({
      component: InfoChallengeGroupModalPage,
      cssClass: 'modal-challenge',
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
}
