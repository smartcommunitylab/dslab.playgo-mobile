import { Component, OnInit } from '@angular/core';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { CreditsModalComponent } from './credits-modal/credits-modal.component';
import { UserService } from 'src/app/core/shared/services/user.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(public appStatusService: AppStatusService, private modalController: ModalController, private userService: UserService) { }
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
    const language = this.userService.getLanguage();

    Browser.open({
      url: language === 'it' ? environment.support.privacy : environment.support.privacyEng,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openFaq() {
    const language = this.userService.getLanguage();
    Browser.open({
      url: language === 'it' ? environment.support.faq : environment.support.faqEng,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openHelp() {
    window.open('mailto:' + environment.support.email);
  }
}
