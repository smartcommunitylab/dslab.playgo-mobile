import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { random, sample } from 'lodash';
import { UserError } from '../../services/error.service';
import { CarpoolingRoleDialogComponent } from './carpooling-role-dialog';
import { CarpoolingScanQRDialogComponent } from './carpooling-scan-qr-dialog/carpooling-scan-qr-dialog.component';
import { CarpoolingShowQRDialogComponent } from './carpooling-show-qr-dialog/carpooling-show-qr-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CarPoolingService {
  constructor(private modalController: ModalController) {}

  public async startCarPoolingTrip(): Promise<string> {
    console.log('startCarPoolingTrip started!');
    const role = await this.isDriverOrPassenger();
    if (role === 'driver') {
      const id: string = this.generateRandomId();
      await this.showQRDialog(id);
      return `D_${id}`;
    } else {
      const id = await this.scanQR();
      return `P_${id}`;
    }
  }
  private generateRandomId() {
    return String(random(99999)).padStart(5, '0');
  }
  private async isDriverOrPassenger(): Promise<CarpoolingRole> {
    const modal = await this.modalController.create({
      component: CarpoolingRoleDialogComponent,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    const role = data?.role;
    if (!role) {
      throw NO_ROLE_CHOSEN;
    }
    console.log(role);
    return role;
  }
  private async showQRDialog(id: string): Promise<boolean> {
    const modal = await this.modalController.create({
      component: CarpoolingShowQRDialogComponent,
      componentProps: { id },
    });

    await modal.present();
    // TODO: do we allow also dismiss -> throw error?
    const { data } = await modal.onWillDismiss();
    if (!data) {
      throw NO_CONFIRMED;
    }
    console.log(data);
    return data;
  }

  private async scanQR(): Promise<string> {
    const modal = await this.modalController.create({
      component: CarpoolingScanQRDialogComponent,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    const id: string = data?.id;
    if (!id) {
      throw NO_PASSENGER_CARPOOLING_ID;
    }

    return id;
  }
}
export type CarpoolingRole = 'driver' | 'passenger';
export const QR_CODE_PREFIX = 'play&go_carpooling_';

const NO_ROLE_CHOSEN = new UserError({
  id: 'NO_ROLE_CHOSEN',
  message: 'tracking.car.errors.NO_ROLE_CHOSEN',
});
const NO_CONFIRMED = new UserError({
  id: 'NO_CONFIRMED',
  message: 'tracking.car.errors.NO_CONFIRMED',
});

const NO_PASSENGER_CARPOOLING_ID = new UserError({
  id: 'NO_PASSENGER_CARPOOLING_ID',
  message: 'tracking.car.errors.NO_PASSENGER_CARPOOLING_ID',
});

export const INCORRECT_QR_CODE = new UserError({
  id: 'INCORRECT_QR_CODE',
  message: 'tracking.car.errors.INCORRECT_QR_CODE',
});
