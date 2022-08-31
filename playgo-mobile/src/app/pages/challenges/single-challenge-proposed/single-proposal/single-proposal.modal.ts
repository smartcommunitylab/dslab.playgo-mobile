import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Campaign } from 'src/app/core/api/generated/model/campaign';
import { AlertService } from 'src/app/core/shared/services/alert.service';
import { Challenge } from '../../challenges.page';

@Component({
  selector: 'app-single-proposal',
  templateUrl: './single-proposal.modal.html',
  styleUrls: ['./single-proposal.modal.scss'],
})
export class SingleProposalModalPage implements OnInit {
  challenge: Challenge;
  campaign: Campaign;

  constructor(private modalController: ModalController) {}
  ngOnInit() {}
  //computed errorcontrol

  close() {
    this.modalController.dismiss(false);
  }
  activate() {
    this.modalController.dismiss(false);
  }
}
