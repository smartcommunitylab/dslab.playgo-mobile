import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { merge, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { isNotConstant, tapLog } from '../../utils';
import { TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';
import { MapComponent } from './map/map.component';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private manualToggleModalSubject = new Subject<boolean>();
  private modal: HTMLIonModalElement;

  private isInNotInitialTrip$: Observable<boolean> =
    this.tripService.tripPart$.pipe(
      filter((tripPart) => tripPart === TRIP_END || !tripPart.isInitial),
      map(isNotConstant(TRIP_END)),
      distinctUntilChanged(),
      shareReplay(1)
    );

  public modalShouldBeOpened$ = merge(
    this.manualToggleModalSubject,
    this.isInNotInitialTrip$
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
      // breakpoints: [0, 0.2, 0.5, 1],
      // initialBreakpoint: 0.2,
    });
    await this.modal.present();
  }

  private async closeMapModal() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }
}
