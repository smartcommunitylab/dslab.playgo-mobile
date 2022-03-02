import { Component, DoCheck, Input, NgZone, OnInit } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { join, map as _map } from 'lodash-es';
import { merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
import { TransportType } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent {
  public transportTypeOptions: {
    transportType: TransportType;
    icon: string;
  }[] = [
    { transportType: 'walk', icon: 'walk' },
    { transportType: 'bicycle', icon: 'bicycle' },
    { transportType: 'bus', icon: 'bus' },
    { transportType: 'car', icon: 'car' },
  ];

  public locationTransportTypes$: Observable<string> =
    this.backgroundTrackingService.notSynchronizedLocations$.pipe(
      map((locations) => _map(locations, 'transportType').join())
    );

  private manualToggleModalSubject = new Subject<boolean>();

  public modalShouldBeOpened$ = merge(
    this.manualToggleModalSubject,
    this.tripService.isInTrip$
  );

  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService
  ) {}

  toggleModal(open: boolean) {
    this.manualToggleModalSubject.next(open);
  }
}
