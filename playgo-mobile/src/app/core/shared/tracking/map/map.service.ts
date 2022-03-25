import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { merge, Subject } from 'rxjs';
import { shareReplay, startWith } from 'rxjs/operators';
import { TripService } from '../trip.service';
import { MapComponent } from './map/map.component';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private manualToggleModalSubject = new Subject<boolean>();
  private modal: HTMLIonModalElement;

  public modalShouldBeOpened$ = merge(
    this.manualToggleModalSubject,
    this.tripService.isInTrip$
  ).pipe(startWith(false), shareReplay(1));

  constructor(
    private tripService: TripService,
    private modalController: ModalController
  ) {
    this.modalShouldBeOpened$.subscribe((shouldBeOpen) =>
      this.toggleMapModal(shouldBeOpen)
    );
  }
  public showMap() {
    this.manualToggleModalSubject.next(true);
  }

  private toggleMapModal(shouldBeOpen: boolean) {
    if (shouldBeOpen) {
      this.openMapModal();
    } else {
      this.closeMapModal();
    }
  }
  private async openMapModal() {
    // modal is not reused
    this.modal = await this.modalController.create({
      component: MapComponent,
    });
    await this.modal.present();
  }

  private async closeMapModal() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }
}
