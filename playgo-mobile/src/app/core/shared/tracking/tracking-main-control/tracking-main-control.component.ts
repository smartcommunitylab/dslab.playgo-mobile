import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { map as _map, round } from 'lodash-es';
import { DateTime, Duration } from 'luxon';
import { EMPTY, Observable, of, Subject, Subscription, timer } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs/operators';
import { tapLog } from '../../utils';
// import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';
import { TripPart, TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-main-control',
  templateUrl: './tracking-main-control.component.html',
  styleUrls: ['./tracking-main-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingMainControlComponent implements DoCheck, OnDestroy {
  @ViewChild('timeElapsed')
  private timeElapsedElement: ElementRef;

  private isDestroyed$ = new Subject<boolean>();
  private timeInTripPartOutOfZoneSubject = new Subject<TripPart | TRIP_END>();
  private timeInTripPart$: Observable<string> =
    this.timeInTripPartOutOfZoneSubject.pipe(
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
      takeUntil(this.isDestroyed$)
    );

  constructor(
    private zone: NgZone,
    private renderer: Renderer2,
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService
  ) {
    this.tripService.tripPart$.subscribe((tripPart) => {
      this.zone.runOutsideAngular(() => {
        this.timeInTripPartOutOfZoneSubject.next(tripPart);
      });
    });

    this.timeInTripPart$
      .pipe(takeUntil(this.isDestroyed$))
      .subscribe((timeString) => {
        this.renderTime(timeString);
      });
  }

  renderTime(timeString: string) {
    if (this.timeElapsedElement) {
      this.renderer.setProperty(
        this.timeElapsedElement.nativeElement,
        'innerHTML',
        timeString
      );
    }
  }

  ngDoCheck() {
    console.log('tick!');
  }

  ngOnDestroy() {
    this.isDestroyed$.next(true);
    this.isDestroyed$.complete();
  }
}
