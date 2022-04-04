import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  Map,
  LatLng,
  latLng,
  Layer,
  MapOptions,
  polyline,
  tileLayer,
} from 'leaflet';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, take, takeUntil } from 'rxjs/operators';
import { concat, map as _map } from 'lodash-es';
import {
  TransportType,
  transportTypeColors,
} from 'src/app/core/shared/tracking/trip.model';
import { tapLog } from 'src/app/core/shared/utils';
import { decode } from '@googlemaps/polyline-codec';

@Component({
  selector: 'app-trip-detail-map',
  templateUrl: './trip-detail-map.component.html',
  styleUrls: ['./trip-detail-map.component.scss'],
})
export class TripDetailMapComponent implements OnInit, OnDestroy {
  @Input()
  public set tripParts(tripParts: TripPartDetail[]) {
    console.log('tripParts', tripParts);
    this.tripPartsSubject.next(tripParts);
  }

  tripPartsSubject = new ReplaySubject<TripPartDetail[]>(1);

  public mapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 25,
        minZoom: 10,
        // attribution: '...',
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

  public tripPartLineLayers$: Observable<Layer[]> = this.tripPartsDecoded$.pipe(
    map((tripParts) =>
      _map(tripParts, (eachPart) =>
        polyline(eachPart.polyline, {
          color: transportTypeColors[eachPart.tripMean.toLowerCase()],
        })
      )
    ),
    shareReplay(1)
  );

  public tripBounds$ = this.tripPartsDecoded$.pipe(
    map((tripParts) => {
      const fullPolyLineCoords = concat(
        tripParts.map((tripPart) => tripPart.polyline)
      );
      return polyline(fullPolyLineCoords).getBounds();
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

interface TripPartDetail {
  tripMean: TransportType;
  polyline: string;
}
