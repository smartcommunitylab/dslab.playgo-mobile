import { Component, NgZone } from '@angular/core';
import { map as _map, round } from 'lodash-es';
import { DateTime, Duration } from 'luxon';
import { EMPTY, Observable, of, timer } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { tapLog } from '../../utils';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
import { TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
})
export class TrackingMainControlComponent {
  timeInTripPart$: Observable<string> = this.zone.runOutsideAngular(() =>
    this.tripService.tripPart$.pipe(
      switchMap((tripPart) => {
        if (!tripPart || tripPart === TRIP_END) {
          return of(null) as Observable<number>;
        }
        const tripStart = tripPart.start || new Date().getTime();
        return timer(0, 50).pipe(map(() => new Date().getTime() - tripStart));
      }),
      map((time) => (time === null ? null : round(time, 1000))),
      distinctUntilChanged(),
      map((elapsedTime) => {
        if (elapsedTime === null) {
          return '';
        }
        return Duration.fromMillis(elapsedTime)
          .shiftTo('hours', 'minutes', 'seconds')
          .normalize()
          .toHuman({
            maximumFractionDigits: 0,
            //localeMatcher: 'it',
          });
      }),
      distinctUntilChanged(),
      tapLog('string')
    )
  );

  constructor(
    public tripService: TripService,
    private zone: NgZone,
    public backgroundTrackingService: BackgroundTrackingService
  ) {}
}
