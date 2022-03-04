import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarpoolingRole } from './carpooling.service';

@Component({
  selector: 'app-carpooling-role-dialog',
  template: `
    <div>Which mode are you?</div>
    <ion-button (click)="roleChosen('driver')" size="large">Driver</ion-button>
    <ion-button (click)="roleChosen('passenger')" size="large"
      >Passenger</ion-button
    >
  `,
})
export class CarpoolingRoleDialogComponent implements OnInit {
  constructor(private modalController: ModalController) {}
  roleChosen(role: CarpoolingRole) {
    this.modalController.dismiss({ role });
  }
  ngOnInit() {}
}
