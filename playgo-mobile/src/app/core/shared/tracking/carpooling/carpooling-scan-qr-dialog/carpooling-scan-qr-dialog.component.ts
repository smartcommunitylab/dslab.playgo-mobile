import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { INCORRECT_QR_CODE, QR_CODE_PREFIX } from '../carpooling.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-carpooling-scan-qr-dialog',
  templateUrl: './carpooling-scan-qr-dialog.component.html',
  styleUrls: ['./carpooling-scan-qr-dialog.component.scss'],
})
export class CarpoolingScanQRDialogComponent implements OnInit, OnDestroy {
  public manualId = '';

  constructor(private modalController: ModalController) {
    // FIXME: debug
    (window as any).BarcodeScanner = BarcodeScanner;
  }

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

  async startScan() {
    try {
      await BarcodeScanner.checkPermission({ force: true });
      // make background of WebView transparent
      this.hideBackground();

      const result = await BarcodeScanner.startScan(); // start scanning and wait for a result

      this.showBackground();

      // if the result has content
      if (result.hasContent) {
        console.log(result.content); // log the raw scanned content
        this.qrCodeScanned(result.content);
      }
    } finally {
      this.showBackground();
    }
  }
  ngOnInit() {}

  async hideBackground() {
    await BarcodeScanner.hideBackground(); // make background of WebView transparent
    document.body.classList.add('qr-scanner');
  }
  async showBackground() {
    await BarcodeScanner.showBackground();
    document.body.classList.remove('qr-scanner');
  }

  ngOnDestroy(): void {
    this.showBackground();
    BarcodeScanner.stopScan();
  }
}
