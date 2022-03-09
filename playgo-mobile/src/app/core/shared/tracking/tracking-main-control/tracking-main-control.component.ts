import { Component } from '@angular/core';
import { map as _map } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent {
  public locationTransportTypes$: Observable<string> =
    this.backgroundTrackingService.notSynchronizedLocations$.pipe(
      map((locations) => _map(locations, 'transportType').join())
    );

  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService
  ) {}
}
