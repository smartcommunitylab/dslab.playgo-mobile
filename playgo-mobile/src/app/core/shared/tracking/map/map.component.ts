/* eslint-disable @typescript-eslint/member-ordering */
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  MapOptions,
  Map,
  tileLayer,
  marker,
  latLng,
  polygon,
  Polygon,
  Layer,
  LatLng,
  polyline,
  icon,
  Icon,
} from 'leaflet';
import { first, last } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  private defaultMapCenter = latLng(28.6448, 77.216721); //Trento

  public mapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 25,
        minZoom: 10,
        // attribution: '...',
      }),
    ],
    zoom: 15,
    center: this.defaultMapCenter,
  };

  private tripCoordinates$: Observable<LatLng[]> =
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map((locations) =>
        locations.map((tripLocation) =>
          latLng(tripLocation.latitude, tripLocation.longitude)
        )
      )
    );
  public mapCenter$: Observable<LatLng> = this.tripCoordinates$.pipe(
    map(last),
    startWith(this.defaultMapCenter)
  );
  public tripLineLayer$: Observable<Layer> = this.tripCoordinates$.pipe(
    map((trip) => polyline(trip))
  );
  public currentLocationLayer$: Observable<Layer> =
    this.backgroundTrackingService.currentLocation$.pipe(
      map((currentLocation) =>
        marker(latLng(currentLocation.latitude, currentLocation.longitude), {
          icon: icon({
            ...Icon.Default.prototype.options,
            iconUrl: 'assets/marker-icon.png',
            iconRetinaUrl: 'assets/marker-icon-2x.png',
            shadowUrl: 'assets/marker-shadow.png',
          }),
        })
      )
    );
  constructor(private backgroundTrackingService: BackgroundTrackingService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // FIXME:
    setTimeout(() => {
      console.log('manual resize');
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  }
}
