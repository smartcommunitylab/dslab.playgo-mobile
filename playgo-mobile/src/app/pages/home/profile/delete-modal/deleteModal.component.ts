import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.page.html',
  styleUrls: ['./delete-modal.page.css'],
})
export class DeleteModalPage implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  accept() {
    this.modalController.dismiss(true);
  }
  close() {
    this.modalController.dismiss(false);
  }
}
