import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
import { MapComponent } from '../map/map/map.component';
import { TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent {
  public fabListActive = false;
  private mapModal: HTMLIonModalElement;

  private tripStopped$: Observable<boolean> = this.tripService.tripPart$.pipe(
    filter((tripPart) => tripPart === TRIP_END),
    mapTo(false)
  );

  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService,
    private modalController: ModalController
  ) {
    this.tripStopped$.subscribe(() => {
      this.hideMapAndButtons();
    });
  }
  public fabListActivated(fabListActive: boolean) {
    if (fabListActive) {
      this.showMapAndButtons();
    } else {
      this.hideMapAndButtons();
    }
  }

  private async showMapAndButtons() {
    // modal is not reused
    this.mapModal = await this.modalController.create({
      component: MapComponent,
      // breakpoints: [0, 0.2, 0.5, 1],
      // initialBreakpoint: 0.2,
    });
    this.fabListActive = true;
    await this.mapModal.present();
  }
  private async hideMapAndButtons() {
    this.fabListActive = false;
    if (this.mapModal) {
      this.mapModal.dismiss();
    }
  }
}
