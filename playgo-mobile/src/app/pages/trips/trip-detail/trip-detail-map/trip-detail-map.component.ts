import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  Map,
  LatLng,
  latLng,
  Layer,
  MapOptions,
  polyline,
  tileLayer,
  latLngBounds,
  marker,
  icon,
  LatLngTuple,
  Icon,
} from 'leaflet';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, take, takeUntil } from 'rxjs/operators';
import { concat, map as _map, first as _first, last as _last } from 'lodash-es';
import {
  TransportType,
  transportTypeColors,
} from 'src/app/core/shared/tracking/trip.model';
import { decode } from '@googlemaps/polyline-codec';
import { TrackedInstanceInfo } from 'src/app/core/api/generated/model/trackedInstanceInfo';

@Component({
  selector: 'app-trip-detail-map',
  templateUrl: './trip-detail-map.component.html',
  styleUrls: ['./trip-detail-map.component.scss'],
})
export class TripDetailMapComponent implements OnInit, OnDestroy {
  @Input()
  public set tripParts(tripParts: TrackedInstanceInfo[]) {
    console.log('tripParts', tripParts);
    this.tripPartsSubject.next(tripParts);
  }

  tripPartsSubject = new ReplaySubject<TrackedInstanceInfo[]>(1);

  public mapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, // for lower zooms there are no tiles!
        minZoom: 10,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
  };

  tripPartsDecoded$ = this.tripPartsSubject.pipe(
    map((tripParts) =>
      _map(tripParts, (tripPart) => {
        const decoded = decode(tripPart.polyline);
        return {
          ...tripPart,
          polyline: decoded,
        };
      })
    ),
    shareReplay(1)
  );

  private fullPolyLineCoords$: Observable<LatLngTuple[]> =
    this.tripPartsDecoded$.pipe(
      map((tripParts) => {
        const polylines = tripParts.map((tripPart) => tripPart.polyline);
        const mergedParts = ([] as LatLngTuple[]).concat.apply([], polylines);
        return mergedParts;
      })
    );

  public startMarker$: Observable<Layer> = this.fullPolyLineCoords$.pipe(
    map(_first),
    map((coordinate) =>
      marker(latLng(coordinate), {
        icon: icon({
          ...Icon.Default.prototype.options,
          // TODO: set proper svg icon
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      })
    )
  );
  public endMarker$: Observable<Layer> = this.fullPolyLineCoords$.pipe(
    map(_last),
    map((coordinate) =>
      marker(latLng(coordinate), {
        icon: icon({
          ...Icon.Default.prototype.options,
          // TODO: set proper svg icon
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      })
    )
  );

  public tripPartLineLayers$: Observable<Layer[]> = this.tripPartsDecoded$.pipe(
    map((tripParts) =>
      _map(tripParts, (eachPart) =>
        polyline(eachPart.polyline, {
          color: transportTypeColors[eachPart.modeType as TransportType],
        })
      )
    ),
    shareReplay(1)
  );

  public tripBounds$ = this.fullPolyLineCoords$.pipe(
    map((fullPolyLineCoords) => {
      const bounds = polyline(fullPolyLineCoords).getBounds();
      const southNorthDistance = bounds.getNorth() - bounds.getSouth();

      const boundsWithSpaceForDetail = latLngBounds(
        latLng(bounds.getNorth() - 2 * southNorthDistance, bounds.getWest()),
        bounds.getNorthEast()
      );
      return boundsWithSpaceForDetail;
    })
  );

  private componentDestroyed$ = new Subject<boolean>();

  constructor() {}

  onMapReady(mapInstance: Map) {
    this.initMap(mapInstance);
    mapInstance.invalidateSize();
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 500);
  }

  initMap(mapInstance: Map) {
    this.tripBounds$
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe((bounds) => {
        mapInstance.fitBounds(bounds);
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }
}
