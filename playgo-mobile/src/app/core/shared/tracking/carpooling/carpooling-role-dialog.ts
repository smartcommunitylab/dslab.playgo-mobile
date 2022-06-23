import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarpoolingRole } from './carpooling.service';

@Component({
  selector: 'app-carpooling-role-dialog',
  templateUrl: './carpooling.modal.html',
  styleUrls: ['./carpooling.modal.scss'],
})
export class CarpoolingRoleDialogComponent implements OnInit {
  constructor(private modalController: ModalController) {}
  roleChosen(role: CarpoolingRole) {
    this.modalController.dismiss({ role });
  }
  ngOnInit() {}
  close() {
    this.modalController.dismiss();
  }
}
