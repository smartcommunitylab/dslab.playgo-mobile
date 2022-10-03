import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sent-invitation',
  templateUrl: './sent-invitation.modal.html',
  styleUrls: ['./sent-invitation.modal.scss'],
})
export class SentInvitationlModalPage implements OnInit {
  opponentName: string;
  constructor(private modalController: ModalController) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
}
