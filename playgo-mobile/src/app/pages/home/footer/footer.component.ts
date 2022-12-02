import { Component, OnInit } from '@angular/core';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { CreditsModalComponent } from './credits-modal/credits-modal.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(public appStatusService: AppStatusService, private modalController: ModalController) { }
  async ngOnInit() {

  }
  async openCredits() {
    const modal = await this.modalController.create({
      component: CreditsModalComponent,
      cssClass: 'challenge-info',
      swipeToClose: true,
    });
    await modal.present();
    await modal.onWillDismiss();
  }
  openPrivacy() {
    Browser.open({
      url: environment.support.privacy,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openFaq() {
    Browser.open({
      url: environment.support.faq,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openHelp() {
    window.open('mailto:' + environment.support.email);
  }
}
