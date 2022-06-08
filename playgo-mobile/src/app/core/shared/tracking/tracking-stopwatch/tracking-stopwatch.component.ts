import {
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { round } from 'lodash-es';
import { Duration } from 'luxon';
import { Subject, Observable, of, timer } from 'rxjs';
import {
  switchMap,
  distinctUntilChanged,
  takeUntil,
  map,
} from 'rxjs/operators';
import { runOutsideAngular } from '../../utils';
import { TRIP_END } from '../trip.model';
import { TripService } from '../trip.service';

@Component({
  selector: 'app-tracking-stopwatch',
  templateUrl: './tracking-stopwatch.component.html',
  styleUrls: ['./tracking-stopwatch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingStopwatchComponent implements DoCheck, OnDestroy {
  @ViewChild('timeElapsed')
  private timeElapsedElement: ElementRef;

  private isDestroyed$ = new Subject<boolean>();

  private timeInTripPart$: Observable<string> = this.tripService.tripPart$.pipe(
    runOutsideAngular(this.zone),
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
        .toFormat('hh:mm:ss');
    }),
    distinctUntilChanged()
  );

  constructor(
    private zone: NgZone,
    private renderer: Renderer2,
    public tripService: TripService
  ) {
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
    // console.log('tick!');
  }

  ngOnDestroy() {
    this.isDestroyed$.next(true);
    this.isDestroyed$.complete();
  }
}
