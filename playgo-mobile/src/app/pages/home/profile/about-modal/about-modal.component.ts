import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';

@Component({
  selector: 'app-about-modal',
  templateUrl: './about-modal.component.html',
  styleUrls: ['./about-modal.component.scss'],
})
export class AboutModalComponent implements OnInit {
  constructor(
    private modalController: ModalController,
    public appStatusService: AppStatusService
  ) {}

  ngOnInit() {}
  close() {
    this.modalController.dismiss();
  }
}
