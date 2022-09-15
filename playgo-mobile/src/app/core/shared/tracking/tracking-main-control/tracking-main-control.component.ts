import { Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { PageSettingsService } from '../../services/page-settings.service';
import { tapLog } from '../../utils';
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
    private pageSettingsService: PageSettingsService
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

  public backdropClicked(event: Event) {
    console.log(event);
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
