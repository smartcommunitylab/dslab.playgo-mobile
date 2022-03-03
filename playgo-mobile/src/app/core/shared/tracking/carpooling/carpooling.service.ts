import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { random, sample } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class CarPoolingService {
  constructor(public modalController: ModalController) {}
  public async startCarPoolingTrip(): Promise<string> {
    const role = await this.isDriverOrPassenger();
    if (role === 'driver') {
      const id = this.generateRandomId();
      await this.showQRDialog(id);
      return `D_${id}`;
    } else {
      const id = this.scanQR();
      return `P_${id}`;
    }
  }
  private generateRandomId() {
    return String(random(99999)).padStart(5, '0');
  }
  private async isDriverOrPassenger(): Promise<'driver' | 'passenger'> {
    return sample(['driver', 'passenger']);
  }
  private async showQRDialog(id: string): Promise<boolean> {
    return true;
  }
  private async scanQR(): Promise<string> {
    return '12345';
  }
}
