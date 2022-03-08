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
  first,
  initial,
  zip,
  tail,
  concat,
  isEqual,
} from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  BackgroundTrackingService,
  TripLocation,
} from '../../background-tracking.service';
import { TransportType } from '../../trip.model';
import { getAdjacentPairs, groupByConsecutiveValues } from '../../utils';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public mapInstance: Map;
  // TODO: where should be map displayed by default?
  private defaultMapCenter = latLng(46.06787, 11.12108); //Trento

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
    bike: 'red',
    bus: 'green',
    car: 'yellow',
    train: 'blue',
    walk: 'brown',
    boat: 'blue',
  };

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

  public currentLatLng$: Observable<LatLng> =
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map(last),
      map(locationToCoordinate)
    );

  public tripInitialLatLng$: Observable<LatLng> =
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map(first),
      distinctUntilChanged(isEqual),
      map(locationToCoordinate)
    );

  public currentLocationLayer$: Observable<Layer> = this.currentLatLng$.pipe(
    map((coordinates) =>
      marker(coordinates, {
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

  onMapReady(mapInstance: Map) {
    // TODO: invalidateSize on modal show event
    this.mapInstance = mapInstance;
    setTimeout(() => {
      this.mapInstance.invalidateSize();
    });
  }
}
function locationToCoordinate(tripLocation: TripLocation): LatLng {
  return latLng(tripLocation.latitude, tripLocation.longitude);
}

function tripToCoordinates(trip: TripLocation[]): LatLng[] {
  return trip.map(locationToCoordinate);
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
