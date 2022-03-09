import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CarpoolingRole } from './carpooling.service';

@Component({
  selector: 'app-carpooling-role-dialog',
  template: `
    <div>{{ 'tracking.car.choose_role' | translate }}</div>
    <ion-button (click)="roleChosen('driver')" size="large">{{
      'tracking.car.driver' | translate
    }}</ion-button>
    <ion-button (click)="roleChosen('passenger')" size="large">{{
      'tracking.car.passenger' | translate
    }}</ion-button>
  `,
})
export class CarpoolingRoleDialogComponent implements OnInit {
  constructor(private modalController: ModalController) {}
  roleChosen(role: CarpoolingRole) {
    this.modalController.dismiss({ role });
  }
  ngOnInit() {}
}
