import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { INCORRECT_QR_CODE, QR_CODE_PREFIX } from '../carpooling.service';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation
} from '@capacitor/barcode-scanner';

@Component({
  selector: 'app-carpooling-scan-qr-dialog',
  templateUrl: './carpooling-scan-qr-dialog.component.html',
  styleUrls: ['./carpooling-scan-qr-dialog.component.scss'],
  standalone: false
})
export class CarpoolingScanQRDialogComponent implements OnInit, OnDestroy {
  public manualId = '';

  constructor(private modalController: ModalController) {}

  qrCodeScanned(qrCode: string) {
    if (!qrCode || !qrCode.startsWith(QR_CODE_PREFIX)) {
      throw INCORRECT_QR_CODE;
    }
    const id = qrCode.replace(QR_CODE_PREFIX, '');
    this.idSelected(id);
  }

  public isManualIdValid() {
    return Boolean(this.manualId.match(/^\d{5}$/));
  }

  manualIdEnter() {
    this.idSelected(this.manualId);
  }

  idSelected(id: string) {
    this.modalController.dismiss({ id });
  }

  close() {
    this.modalController.dismiss();
  }

  async startScan() {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: 'Inquadra il QR Code',
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
        scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE
      });

      if (result?.ScanResult) {
        console.log('QR letto:', result.ScanResult);
        this.qrCodeScanned(result.ScanResult);
      }
    } catch (err) {
      console.error('Errore durante la scansione:', err);
    }
  }

  ngOnInit() {}

  ngOnDestroy(): void {
  }
}
