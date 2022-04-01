import { Component, Input, OnInit } from '@angular/core';
import {
  LatLng,
  latLng,
  Layer,
  MapOptions,
  polyline,
  tileLayer,
} from 'leaflet';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { map as _map } from 'lodash-es';
import {
  TransportType,
  transportTypeColors,
} from 'src/app/core/shared/tracking/trip.model';

@Component({
  selector: 'app-trip-detail-map',
  templateUrl: './trip-detail-map.component.html',
  styleUrls: ['./trip-detail-map.component.scss'],
})
export class TripDetailMapComponent implements OnInit {
  @Input()
  public set tripParts(tripParts: TripPartDetail[]) {
    this.tripParts$.next(tripParts);
  }
  tripParts$ = new Subject<TripPartDetail[]>();

  initialLatLng$ = this.tripParts$.pipe(
    map((tripParts) => {
      // TODO: parse polyline, and get best latlng
      console.log(tripParts);
      const coords: string = tripParts[0].polyline.split(' ')[0];
      const splitted: [number, number] = coords
        .split(',')
        .map((s) => parseFloat(s)) as [number, number];
      return latLng(splitted);
    })
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
      zoom: 15,
      center: initLatLng,
    })),
    shareReplay(1)
  );

  public tripPartLineLayers$: Observable<Layer[]> = this.tripParts$.pipe(
    map((tripParts) =>
      _map(tripParts, (eachPart) =>
        polyline(polylineStringToCoordinates(eachPart.polyline), {
          color: transportTypeColors[eachPart.tripMean],
        })
      )
    )
  );

  constructor() {}

  ngOnInit() {}
}

function polylineStringToCoordinates(polylineString: string): LatLng[] {
  return [];
}

interface TripPartDetail {
  tripMean: TransportType;
  polyline: string;
}
