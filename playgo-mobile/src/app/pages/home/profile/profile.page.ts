import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AuthActions, AuthService, IAuthAction } from 'ionic-appauth';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/core/shared/model/user.model';
import { UserStorageService } from 'src/app/core/shared/services/user-storage.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { PrivacyModalPage } from './privacy-modal/privacyModal.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  subProf: Subscription;
  sub!: Subscription;
  profile: IUser;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private userService: UserService,
    private localStorageService: UserStorageService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.onSignOutSuccess(action)
    );
    this.subProf = this.userService.userProfile$.subscribe((profile) => {
      this.profile = profile;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();

    this.subProf.unsubscribe();
  }

  private onSignOutSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignOutSuccess) {
      this.localStorageService.clearUser();
      this.navCtrl.navigateRoot('login');
    }
  }
  updateLanguage() {
    this.userService.updatePlayer(this.profile);
  }
  async openPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyModalPage,
      cssClass: 'modalConfirm',
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  public signOut() {
    this.auth.signOut();
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
