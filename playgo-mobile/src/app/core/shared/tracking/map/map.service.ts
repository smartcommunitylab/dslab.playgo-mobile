import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { merge, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
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
  private modal: HTMLIonModalElement;

  private tripStopped$: Observable<boolean> = this.tripService.tripPart$.pipe(
    filter((tripPart) => tripPart === TRIP_END),
    mapTo(false)
  );

  constructor(
    private tripService: TripService,
    private modalController: ModalController
  ) {
    this.tripStopped$.subscribe(() => {
      this.closeMap();
    });
  }
  public async showMap() {
    // modal is not reused
    this.modal = await this.modalController.create({
      component: MapComponent,
      // breakpoints: [0, 0.2, 0.5, 1],
      // initialBreakpoint: 0.2,
    });
    await this.modal.present();
  }
  public async closeMap() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }
}
