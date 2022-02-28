/* eslint-disable prefer-arrow/prefer-arrow-functions */
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
import {
  map as _map,
  groupBy as _groupBy,
  last,
  initial,
  zip,
  tail,
  first,
  concat,
} from 'lodash-es';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {
  BackgroundTrackingService,
  TripLocation,
} from '../background-tracking.service';
import { TransportType } from '../trip.model';
import { getAdjacentPairs, groupByConsecutiveValues } from '../utils';

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

  private transportTypeColors: Record<TransportType, string> = {
    bicycle: 'red',
    bus: 'green',
    car: 'yellow',
    train: 'blue',
    walk: 'brown',
  };

  private tripCoordinates$: Observable<LatLng[]> =
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map(tripToCoordinates)
    );
  public mapCenter$: Observable<LatLng> = this.tripCoordinates$.pipe(
    map(last),
    startWith(this.defaultMapCenter)
  );
  private tripPartsCoordinates$ =
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map((locations) => groupTripLocationsByTransportType(locations))
    );

  public tripPartLineLayers$: Observable<Layer[]> =
    this.tripPartsCoordinates$.pipe(
      map((tripPartsCoordinates) =>
        _map(tripPartsCoordinates, ({ transportType, tripPartLocations }) =>
          polyline(tripToCoordinates(tripPartLocations), {
            color: this.transportTypeColors[transportType],
          })
        )
      )
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

function tripToCoordinates(trip: TripLocation[]): LatLng[] {
  return trip.map((tripLocation) =>
    latLng(tripLocation.latitude, tripLocation.longitude)
  );
}

function groupTripLocationsByTransportType(
  wholeTrip: TripLocation[]
): GroupedTripPart[] {
  const tripPartsByTransportType = groupByConsecutiveValues(
    wholeTrip,
    'transportType'
  ).map(({ group, values }) => ({
    transportType: group,
    tripPartLocations: values,
  }));

  const inBetweenTripParts = getAdjacentPairs(tripPartsByTransportType).map(
    ([fromTripPart, toTripPart]) => ({
      transportType: toTripPart.transportType,
      tripPartLocations: [
        last(fromTripPart.tripPartLocations),
        first(toTripPart.tripPartLocations),
      ],
    })
  );
  // we do not really care about order, otherwise we would need to complicate it a little bit
  return concat(tripPartsByTransportType, inBetweenTripParts);
}
type GroupedTripPart = {
  transportType: TransportType;
  tripPartLocations: TripLocation[];
};
