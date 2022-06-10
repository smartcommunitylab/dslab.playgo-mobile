import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
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

  private tripStopped$: Observable<boolean> = this.tripService.tripPart$.pipe(
    filter((tripPart) => tripPart === TRIP_END),
    mapTo(false)
  );

  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService
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
    // TODO: animate
    this.trackingUIActive = true;
  }
  private async hideMapAndButtons() {
    // TODO: animate
    this.trackingUIActive = false;
  }
}
