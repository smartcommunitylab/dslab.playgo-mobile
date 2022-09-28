/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-underscore-dangle */
import { NgZone } from '@angular/core';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Map, Control, ControlPosition, LatLng } from 'leaflet';
import {
  EMPTY,
  fromEvent,
  merge,
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  filter,
  mapTo,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { runInZone, tapLog } from '../../../utils';

@Component({
  selector: 'app-current-location-map-control',
  templateUrl: './current-location-map-control.component.html',
  styleUrls: ['./current-location-map-control.component.scss'],
})
export class CurrentLocationMapControlComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  private componentIsDestroyed$ = new Subject<boolean>();

  @Input() set mapCenter(mapCenter: LatLng) {
    this.mapCenter$.next(mapCenter);
  }
  mapCenter$ = new ReplaySubject<LatLng>(1);

  @Input() set mapInstance(mapInstance: Map) {
    this._mapInstance = mapInstance;
    this.mapInstance$.next(mapInstance);
  }
  get mapInstance() {
    return this._mapInstance;
  }
  _mapInstance: Map;
  mapInstance$ = new ReplaySubject<Map>(1);

  @Input() position: ControlPosition = 'topleft';

  @ViewChild('customLocationControl', { static: true })
  public controlElement: ElementRef;

  public control: Control;

  private iconClicked$ = new Subject<'iconClicked'>();

  private mapPanned$: Observable<'mapPanned'> = this.mapInstance$.pipe(
    switchMap((mapInstance) => fromEvent(mapInstance, 'dragstart')),
    runInZone(this.zone),
    mapTo('mapPanned')
  );

  followingEnabled$ = merge(this.iconClicked$, this.mapPanned$).pipe(
    scan((previousFollowingEnabled, currentEvent) => {
      if (currentEvent === 'iconClicked') {
        return !previousFollowingEnabled;
      }
      if (currentEvent === 'mapPanned') {
        return false;
      }
    }, true),
    startWith(true),
    tap(NgZone.assertInAngularZone),
    shareReplay(1)
  );

  private shouldMoveCenter$ = this.followingEnabled$.pipe(
    switchMap((followingEnabled) =>
      followingEnabled ? this.mapCenter$ : EMPTY
    ),
    filter((center) => center !== null),
    withLatestFrom(this.mapInstance$),
    takeUntil(this.componentIsDestroyed$)
  );

  constructor(private zone: NgZone) {
    this.shouldMoveCenter$.subscribe(([center, mapInstance]) =>
      mapInstance.setView(center, undefined, { noMoveStart: true })
    );
  }

  ngAfterViewInit() {
    this.createControl(this.mapInstance, this.controlElement);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
    if (this.mapInstance && this.control) {
      this.mapInstance.removeControl(this.control);
    }
  }

  public onClick(): void {
    this.iconClicked$.next('iconClicked');
  }

  /** Should be called once mapInstance and control element are available */
  private createControl(mapInstance: Map, controlElement: ElementRef) {
    this.control = this.getControl(controlElement);
    this.control.addTo(mapInstance);
  }

  private getControl(controlElement: ElementRef) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Custom = Control.extend({
      onAdd(mapInstance: Map) {
        return controlElement.nativeElement;
      },
      onRemove(mapInstance: Map) {},
    });
    return new Custom({
      position: this.position,
    });
  }
}
