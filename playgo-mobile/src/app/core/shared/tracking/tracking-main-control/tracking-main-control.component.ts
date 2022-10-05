import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { PageSettingsService } from '../../services/page-settings.service';
import { BackgroundTrackingService } from '../background-tracking.service';
import { FirstTimeBackgrounModalPage } from '../first-time-modal/first-time.modal';
import { transportTypeIcons, TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent {
  transportTypeIcons = transportTypeIcons;
  public trackingUIActive = false;

  public hasPermissions: boolean = null;

  private firstTimePermission = this.localStorageService.getStorageOf<boolean>(
    'firstTimePermission'
  );

  public showPlayButton$: Observable<boolean> = combineLatest({
    pageWithPlayFab: this.pageSettingsService.pageSettings$.pipe(
      map((pageSettings) => pageSettings.showPlayButton)
    ),
    isInTrip: this.tripService.isInTrip$.pipe(startWith(false)),
  }).pipe(map(({ isInTrip, pageWithPlayFab }) => isInTrip || pageWithPlayFab));

  private tripStopped$: Observable<boolean> = this.tripService.tripPart$.pipe(
    filter((tripPart) => tripPart === TRIP_END),
    map(() => false)
  );

  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService,
    private pageSettingsService: PageSettingsService,
    private localStorageService: LocalStorageService,
    private modalController: ModalController,
    private router: Router,
    private alertService: AlertService,
    private platform: Platform
  ) {
    this.tripStopped$.subscribe(() => {
      this.hideMapAndButtons();
    });

    this.router.events.subscribe((event) => {
      this.hideMapAndButtons();
    });
  }
  async fabListActivated(fabListActive: boolean) {
    if (fabListActive) {
      this.showMapAndButtons();
    } else {
      this.hideMapAndButtons();
    }

    if (fabListActive && this.hasPermissions !== true) {
      this.hasPermissions = await this.askForPermissions();
      if (!this.hasPermissions) {
        this.hideMapAndButtons();
      }
    }
  }
  private async askForPermissions(): Promise<boolean> {
    if (this.platform.is('android')) {
      const firstTimePermission = await this.firstTimePermission.get();
      if (!firstTimePermission) {
        const modal = await this.modalController.create({
          component: FirstTimeBackgrounModalPage,
          backdropDismiss: false,
          cssClass: 'modal-challenge',
          swipeToClose: true,
        });
        await modal.present();
        const userAcceptsCustomDialog: boolean = (await modal.onWillDismiss())
          .data;
        this.firstTimePermission.set(userAcceptsCustomDialog);

        if (!userAcceptsCustomDialog) {
          return false;
        }
      }
    }
    // return confirm('Do you want to start tracking?');
    const permissionResult =
      await this.backgroundTrackingService.askForPermissions();
    if (permissionResult === 'ACCEPTED') {
      return true;
    }
    if (permissionResult === 'ACCEPTED_WHEN_IN_USE') {
      await this.alertService.presentAlert({
        headerTranslateKey: 'permission_when_in_use.title',
        messageTranslateKey: 'permission_when_in_use.message',
      });
      return true;
    }
    if (permissionResult === 'DENIED_SILENTLY') {
      await this.alertService.presentAlert({
        headerTranslateKey: 'permission_denied.title',
        messageTranslateKey: 'permission_denied.message',
      });
    }
    return false;
  }

  public backdropClicked(event: Event) {
    if ((event.target as any).classList.contains('slide-wrapper')) {
      this.hideMapAndButtons();
    }
    event.stopPropagation();
  }

  private async showMapAndButtons() {
    this.trackingUIActive = true;
  }
  private async hideMapAndButtons() {
    this.trackingUIActive = false;
  }
}
