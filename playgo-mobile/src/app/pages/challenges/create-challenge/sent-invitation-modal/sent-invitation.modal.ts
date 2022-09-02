import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { ChallengeService } from 'src/app/core/shared/services/challenge.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { Challenge } from '../../challenges.page';
import { getTypeStringChallenge } from 'src/app/core/shared/utils';
import { TranslateService } from '@ngx-translate/core';
import { Challengeable } from '../create-challenge.page';
@Component({
  selector: 'app-sent-invitation',
  templateUrl: './sent-invitation.modal.html',
  styleUrls: ['./sent-invitation.modal.scss'],
})
export class SentInvitationlModalPage implements OnInit {
  opponentName: string;
  constructor(
    private modalController: ModalController,
    private translateService: TranslateService
  ) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
}
