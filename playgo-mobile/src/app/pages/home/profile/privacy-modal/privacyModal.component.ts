import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-privacy-modal',
  templateUrl: './privacy-modal.page.html',
  styleUrls: ['./privacy-modal.page.css'],
})
export class PrivacyModalPage implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }
  close() {
    this.modalController.dismiss();
  }
}
