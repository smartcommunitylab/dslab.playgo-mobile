import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challenge } from '../../challenges.page';
import { getTypeStringChallenge } from 'src/app/core/shared/utils';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-invitation-challenge',
  templateUrl: './invitation-challenge.modal.html',
  styleUrls: ['./invitation-challenge.modal.scss'],
})
export class InvitationlModalPage implements OnInit {
  challenge: Challenge;
  campaign: PlayerCampaign;
  typeChallenge: string;
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );
  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private challengeService: ChallengeService,
    private translateService: TranslateService
  ) {}
  ngOnInit() {
    this.typeChallenge = this.translateService.instant(
      getTypeStringChallenge(this.challenge.type)
    );
  }
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
  async activate() {
    try {
      const ret = await this.challengeService.acceptChallenge(
        this.campaign,
        this.challenge
      );
      this.challengeService.challengesRefresher$.next(null);
    } catch (e) {
    } finally {
      this.modalController.dismiss(false);
    }
  }
  reject() {
    try {
      this.challengeService.rejectChallenge(this.campaign, this.challenge);
      this.challengeService.challengesRefresher$.next(null);
    } catch (e) {
    } finally {
      this.modalController.dismiss(false);
    }
  }
  cancel() {
    try {
      this.challengeService.cancelChallenge(this.campaign, this.challenge);
      this.challengeService.challengesRefresher$.next(null);
    } catch (e) {
    } finally {
      this.modalController.dismiss(false);
    }
  }
}
