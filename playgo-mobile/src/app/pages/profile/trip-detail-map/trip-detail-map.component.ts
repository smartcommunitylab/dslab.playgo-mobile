import { Component, Input, OnInit } from '@angular/core';
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
import { map, shareReplay } from 'rxjs/operators';
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
export class TripDetailMapComponent implements OnInit {
  public mapInstance: Map;
  @Input()
  public set tripParts(tripParts: TripPartDetail[]) {
    console.log('tripParts', tripParts);
    this.tripParts$.next(tripParts);
  }
  tripParts$ = new ReplaySubject<TripPartDetail[]>(1);
  tripPartsDecoded$ = this.tripParts$.pipe(
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
  initialLatLng$ = this.tripPartsDecoded$.pipe(
    map((tripParts) => tripParts[0].polyline[0]),
    tapLog('initialLatLng$')
  );

  public mapOptions$: Observable<MapOptions> = this.initialLatLng$.pipe(
    map((initLatLng) => ({
      layers: [
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 25,
          minZoom: 10,
          // attribution: '...',
        }),
      ],
      // zoom: 15,
      // center: initLatLng,
    })),
    tapLog('mapOptions$'),
    shareReplay(1)
  );

  public tripPartLineLayers$: Observable<Layer[]> = this.tripPartsDecoded$.pipe(
    tapLog('tripParts$'),
    map((tripParts) =>
      _map(tripParts, (eachPart) =>
        polyline(eachPart.polyline, {
          color: transportTypeColors[eachPart.tripMean.toLowerCase()],
        })
      )
    ),
    tapLog('tripPartLineLayers$'),
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

  constructor() {
    console.log('TripDetailMapComponent.constructor', this, this.tripParts);
  }

  onMapReady(mapInstance: Map) {
    (window as any).mapInstance = mapInstance;
    // TODO: invalidateSize on modal show event
    this.mapInstance = mapInstance;
    this.tripBounds$.subscribe((bounds) => {
      this.mapInstance.fitBounds(bounds);
    });
    setTimeout(() => {
      this.mapInstance.invalidateSize();
    }, 500);
  }

  ngOnInit() {}
}

interface TripPartDetail {
  tripMean: TransportType;
  polyline: string;
}
