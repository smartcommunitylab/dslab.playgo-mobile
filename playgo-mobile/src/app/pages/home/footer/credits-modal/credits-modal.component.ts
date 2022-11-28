import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-credits-modal',
  templateUrl: './credits-modal.component.html',
  styleUrls: ['./credits-modal.component.scss'],
})
export class CreditsModalComponent implements OnInit {


  constructor(
    private modalController: ModalController
  ) { }

  async ngOnInit() {

  }
  close() {
    this.modalController.dismiss();
  }
}

