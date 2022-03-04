import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-carpooling-show-qr-dialog',
  templateUrl: './carpooling-show-qr-dialog.component.html',
  styleUrls: ['./carpooling-show-qr-dialog.component.scss'],
})
export class CarpoolingShowQRDialogComponent implements OnInit {
  @Input()
  public id: string;
  @Input()
  public qrCode: string;
  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  ngOnInit() {}
}
