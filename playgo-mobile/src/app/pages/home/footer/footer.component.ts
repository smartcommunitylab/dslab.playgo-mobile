import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { CreditsModalComponent } from './credits-modal/credits-modal.component';
import { User, UserService } from 'src/app/core/shared/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  subStat: Subscription;
  profile: User;

  constructor(public appStatusService: AppStatusService, private modalController: ModalController, private userService: UserService) { }
  async ngOnInit() {
    this.subStat = this.userService.userProfile$
      .subscribe((profile) => {
        this.profile = profile;
      });
  }
  ngOnDestroy() {
    this.subStat.unsubscribe();
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
    window.open('mailto:' + environment.support.email +
      '?subject=Play%26go%20Supporto&body=-------------------------------------------------%0D%0A%0D%0AterritoryId: ' +
      this.profile.territoryId + '%0D%0AplayerId: ' +
      this.profile.playerId + '%0D%0A%0D%0A-------------------------------------------------');
  }
}
