import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import {
  concat,
  filter,
  map,
  Observable,
  of,
  scan,
  Subject,
  Subscription,
} from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { User, UserService } from 'src/app/core/shared/services/user.service';
import { AboutModalComponent } from './about-modal/about-modal.component';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { mapTo } from 'src/app/core/shared/rxjs.utils';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { DeleteModalPage } from './delete-modal/deleteModal.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  subProf: Subscription;
  profile: User;

  private developerModeClicksSubject = new Subject<void>();
  private quintupleClicks$ = this.developerModeClicksSubject.pipe(
    map(() => new Date().getTime()),
    scan(
      (acc, current) => acc.filter((t) => current - t < 1000).concat(current),
      []
    ),
    filter((eventsInTimeWindow) => eventsInTimeWindow.length >= 5),
    mapTo(null as void)
  );
  developerMode$: Observable<boolean> = concat(
    of(false),
    this.quintupleClicks$.pipe(mapTo(true))
  );

  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private authService: AuthService,
    private modalController: ModalController,
    public appStatusService: AppStatusService,
    private alertController: AlertController,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.subProf = this.userService.userProfile$
      .pipe(this.errorService.getErrorHandler())
      .subscribe((profile) => {
        this.profile = profile;
      });
  }
  ngOnDestroy() {
  }
  ionViewDidLeave() {
    this.subProf.unsubscribe();
  }

  developerModeSingleClick() {
    this.developerModeClicksSubject.next();
  }

  updateLanguage() {
    this.userService.updatePlayer(this.profile);
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
  openSupport() {
    window.open('mailto:' + environment.support.email +
      '?subject=Play%26go%20Supporto&body=-----------NON CANCELLARE-----------%0D%0A%0D%0AterritoryId: ' +
      this.profile.territoryId + '%0D%0AplayerId: ' +
      this.profile.playerId + '%0D%0A%0D%0A-----SCRIVI IL TUO MESSAGGIO QUI SOTTO----');
  }

  async openAbout() {
    const modal = await this.modalController.create({
      component: AboutModalComponent,
      cssClass: 'modalConfirm',
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  public async signOut() {
    const header = await this.translateService.instant(
      'profile.logoutpopup.title'
    );
    const message = await this.translateService.instant(
      'profile.logoutpopup.message'
    );
    const cancel = await this.translateService.instant(
      'profile.logoutpopup.cancel'
    );
    const ok = await this.translateService.instant('profile.logoutpopup.ok');
    return new Promise(async () => {
      const alert = await this.alertController.create({
        cssClass: 'app-alert',
        header,
        message,
        buttons: [
          {
            text: cancel,
            role: 'cancel',
            cssClass: 'secondary',
            id: 'cancel-button',
          },
          {
            text: ok,
            id: 'confirm-button',
            handler: () => {
              this.authService.logout();
            },
          },
        ],
      });

      await alert.present();
    });
  }
  public async deleteAccount() {
    const modal = await this.modalController.create({
      component: DeleteModalPage,
      cssClass: 'modal-playgo',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      //delete account api e exit application
      try {
        await this.userService.deleteAccount();
        this.authService.logout();
      } catch (e) {
        this.errorService.handleError(e, 'normal');
      }
    }
  }
}
