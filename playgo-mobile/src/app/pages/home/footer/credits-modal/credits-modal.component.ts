import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';


@Component({
  selector: 'app-credits-modal',
  templateUrl: './credits-modal.component.html',
  styleUrls: ['./credits-modal.component.scss'],
})
export class CreditsModalComponent implements OnInit {


  constructor(
    private modalController: ModalController,
    public appStatusService: AppStatusService
  ) { }

  async ngOnInit() {

  }
  close() {
    this.modalController.dismiss();
  }
  openLink(link: string) {
    Browser.open({
      url: link,
      windowName: '_system',
      presentationStyle: 'popover',
    });
    return true;
  }
}

