import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { IUser } from 'src/app/core/shared/model/user.model';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { AboutModalComponent } from './about-modal/about-modal.component';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  subProf: Subscription;
  profile: IUser;
  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.subProf = this.userService.userProfile$
      .pipe(this.errorService.getErrorHandler())
      .subscribe((profile) => {
        this.profile = profile;
      });
  }
  ngOnDestroy() {
    this.subProf.unsubscribe();
  }

  updateLanguage() {
    this.userService.updatePlayer(this.profile);
  }
  openPrivacy() {
    Browser.open({
      url: 'https://www.smartcommunitylab.it/playgo_privacy-e-trattamento-dati/',
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openFaq() {
    Browser.open({
      url: 'https://www.smartcommunitylab.it/playgo_faq/',
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  openSupport() {
    window.open('mailto:playandgo@smartcommunitylab.it');
  }

  async openAbout() {
    const modal = await this.modalController.create({
      component: AboutModalComponent,
      cssClass: 'modalConfirm',
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  public signOut() {
    this.authService.logout();
  }
  ngAfterViewInit() {
    const selects = document.querySelectorAll('.app-alert');
    selects.forEach((select) => {
      (select as any).interfaceOptions = {
        cssClass: 'app-alert',
      };
    });
  }
}
