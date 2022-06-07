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
import { runOutsideAngular, tapLog } from '../../utils';
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
export class TrackingMainControlComponent {
  constructor(
    public tripService: TripService,
    public backgroundTrackingService: BackgroundTrackingService
  ) {}
}
