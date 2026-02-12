import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-store-update-modal',
  templateUrl: './store-update-modal.component.html',
  styleUrls: ['./store-update-modal.component.scss'],
  standalone: false
})
export class StoreUpdateModalComponent {
  @Input() currentVersion: string;
  @Input() storeVersion: string;
  @Input() isMandatory: boolean = false;

  constructor(private modalController: ModalController) {}

  async goToStore() {
    await this.modalController.dismiss({ action: 'update' });
  }

  async dismiss() {
    if (!this.isMandatory) {
      await this.modalController.dismiss({ action: 'skip' });
    }
  }
}