import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { INCORRECT_QR_CODE, QR_CODE_PREFIX } from '../carpooling.service';

@Component({
  selector: 'app-carpooling-scan-qr-dialog',
  templateUrl: './carpooling-scan-qr-dialog.component.html',
  styleUrls: ['./carpooling-scan-qr-dialog.component.scss'],
})
export class CarpoolingScanQRDialogComponent implements OnInit {
  public manualId = '';

  constructor(private modalController: ModalController) {}

  qrCodeScanned(qrCode: string) {
    if (!qrCode || !qrCode.startsWith(QR_CODE_PREFIX)) {
      // TODO: show error dialog??
      throw INCORRECT_QR_CODE;
    }
    const id = qrCode.replace(QR_CODE_PREFIX, '');
    this.idSelected(id);
  }
  // TODO: this will be called too often...
  public isManualIdValid() {
    return Boolean(this.manualId.match(/^\d{5}$/));
  }
  manualIdEnter() {
    this.idSelected(this.manualId);
  }
  idSelected(id: string) {
    this.modalController.dismiss({ id });
  }

  ngOnInit() {}
}
