import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  buffer,
  concat,
  debounceTime,
  filter,
  map,
  Observable,
  of,
  scan,
  startWith,
  Subject,
  Subscription,
  throttleTime,
} from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { IUser } from 'src/app/core/shared/model/user.model';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { UserService } from 'src/app/core/shared/services/user.service';
import { AboutModalComponent } from './about-modal/about-modal.component';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { mapTo, tapLog } from 'src/app/core/shared/utils';
import { AppStatusService } from 'src/app/core/shared/services/app-status.service';
import { DeleteModalPage } from './delete-modal/deleteModal.component';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  subProf: Subscription;
  profile: IUser;

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
    public appStatusService: AppStatusService
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
    window.open('mailto:' + environment.support.email);
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
  public async deleteAccount() {
    const modal = await this.modalController.create({
      component: DeleteModalPage,
      cssClass: 'modalConfirm',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      //delete account api e exit application
    }
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
