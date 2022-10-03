import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challenge } from '../../challenges.page';
import { TranslateService } from '@ngx-translate/core';
import { getTypeStringChallenge } from 'src/app/core/shared/campaigns/campaign.utils';
import { ErrorService } from 'src/app/core/shared/services/error.service';
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
    private translateService: TranslateService,
    private errorService: ErrorService
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
      await this.challengeService.acceptChallenge(
        this.campaign,
        this.challenge
      );
    } catch (e) {
      this.errorService.handleError(e);
    } finally {
      this.modalController.dismiss(false);
    }
  }
  async reject() {
    try {
      await this.challengeService.rejectChallenge(
        this.campaign,
        this.challenge
      );
    } catch (e) {
      this.errorService.handleError(e);
    } finally {
      this.modalController.dismiss(false);
    }
  }
  async cancel() {
    try {
      await this.challengeService.cancelChallenge(
        this.campaign,
        this.challenge
      );
    } catch (e) {
      this.errorService.handleError(e);
    } finally {
      this.modalController.dismiss(false);
    }
  }
}
