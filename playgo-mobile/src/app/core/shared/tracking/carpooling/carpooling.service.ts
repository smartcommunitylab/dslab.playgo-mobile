import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { random, sample } from 'lodash';
import { CarpoolingRoleDialogComponent } from './carpooling-role-dialog';
import { CarpoolingShowQRDialogComponent } from './carpooling-show-qr-dialog/carpooling-show-qr-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CarPoolingService {
  private qrCodePrefix = 'play&go_carpooling_';
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
    const role = data.role;
    if (!role) {
      throw NO_ROLE_CHOSEN;
    }
    console.log(role);
    return role;
  }
  private async showQRDialog(id: string): Promise<boolean> {
    const modal = await this.modalController.create({
      component: CarpoolingShowQRDialogComponent,
      componentProps: {
        qrCode: this.qrCodePrefix + id,
        id,
      },
    });

    await modal.present();
    await modal.onWillDismiss();

    // TODO: do we allow also dismiss?
    return true;
  }
  private async scanQR(): Promise<string> {
    alert('scanQR');
    return '12345';
  }
}
export type CarpoolingRole = 'driver' | 'passenger';
const NO_ROLE_CHOSEN = 'NO_ROLE_CHOSEN' as const;
