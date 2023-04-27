import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail.modal.html',
  styleUrls: ['./detail.modal.scss'],
})
export class DetailPrizeModalPage implements OnInit {
  type = 'playgo';
  title: string;
  detail: { [key: string]: string };

  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
