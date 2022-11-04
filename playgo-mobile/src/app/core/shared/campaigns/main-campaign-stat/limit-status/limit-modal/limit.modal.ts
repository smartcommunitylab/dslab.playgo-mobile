import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-limit-modal',
  templateUrl: './limit.modal.html',
  styleUrls: ['./limit.modal.scss'],
})
export class LimitModalPage implements OnInit {

  constructor(private modalController: ModalController) { }
  ngOnInit() { }
  close() {
    this.modalController.dismiss(false);
  }
}
