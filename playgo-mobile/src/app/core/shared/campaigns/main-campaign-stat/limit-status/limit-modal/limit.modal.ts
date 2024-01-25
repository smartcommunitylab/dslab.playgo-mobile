import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Campaign } from 'src/app/core/api/generated/model/campaign';

@Component({
  selector: 'app-limit-modal',
  templateUrl: './limit.modal.html',
  styleUrls: ['./limit.modal.scss'],
})
export class LimitModalPage implements OnInit {
  campaign: Campaign;
  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
