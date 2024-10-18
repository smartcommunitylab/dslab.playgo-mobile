import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { QR_CODE_PREFIX } from '../carpooling.service';

@Component({
  selector: 'app-carpooling-show-qr-dialog',
  templateUrl: './carpooling-show-qr-dialog.component.html',
  styleUrls: ['./carpooling-show-qr-dialog.component.scss'],
})
export class CarpoolingShowQRDialogComponent implements OnInit {
  @Input()
  public id: string;
  public qrCodePrefix = QR_CODE_PREFIX;
  @Input() submitDataToParent: () => void;

  constructor(private modalController: ModalController) { }

  close() {
    this.modalController.dismiss(true);
  }
  // startAndClose() {
  //   this.modalController.dismiss(true);
  // }
  // startAndGenerate() {
  //   this.submitDataToParent();
  // }

  ngOnInit() { }
}
