import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challenge } from '../../challenges.page';

@Component({
  selector: 'app-invitation-challenge',
  templateUrl: './invitation-challenge.modal.html',
  styleUrls: ['./invitation-challenge.modal.scss'],
})
export class InvitationlModalPage implements OnInit {
  challenge: Challenge;
  campaign: Campaign;
  playerId$ = this.userService.userProfile$.pipe(
    map((userProfile) => userProfile.playerId)
  );
  constructor(
    private modalController: ModalController,
    private userService: UserService
  ) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
  activate() {
    this.modalController.dismiss(false);
  }
  reject() {
    this.modalController.dismiss(false);
  }
  cancel() {
    this.modalController.dismiss(false);
  }
}
