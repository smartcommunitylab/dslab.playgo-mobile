import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challenge } from '../challenges.page';
import { InvitationlModalPage } from './invitation-challenge/invitation-challenge.modal';

@Component({
  selector: 'app-couple-challenge-proposed',
  templateUrl: './couple-challenge-proposed.component.html',
  styleUrls: ['./couple-challenge-proposed.component.scss'],
})
export class CoupleChallengeProposedComponent implements OnInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );
  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) {}
  ngOnInit() {}
  async openInvitationPopup() {
    const modal = await this.modalController.create({
      component: InvitationlModalPage,
      cssClass: 'modal-challenge',
      componentProps: {
        challenge: this.challenge,
        campaign: this.campaign,
      },
      swipeToClose: true,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
}
