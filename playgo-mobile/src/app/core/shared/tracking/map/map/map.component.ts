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
  circle,
  circleMarker,
} from 'leaflet';
import {
  map as _map,
  groupBy as _groupBy,
  last as _last,
  first as _first,
  initial,
  zip,
  tail,
  concat as _concat,
  isEqual,
  negate,
  isNil,
} from 'lodash-es';
import { concat, Observable } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import {
  BackgroundTrackingService,
  TripLocation,
} from '../../background-tracking.service';
import { TransportType, transportTypeColors } from '../../trip.model';
import {
  getAdjacentPairs,
  groupByConsecutiveValues,
  tapLog,
} from '../../../utils';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  public mapInstance: Map;

  private initialLatLng$: Observable<LatLng> =
    this.backgroundTrackingService.lastLocation$.pipe(
      filter(negate(isNil)),
      first(),
      tapLog('initialLatLng$'),
      map(locationToCoordinate),
      shareReplay(1)
    );

  public mapOptions$: Observable<MapOptions> = this.initialLatLng$.pipe(
    map((initLatLng) => ({
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, // for lower zooms there are no tiles!
          minZoom: 10,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }),
      ],
      zoom: 15,
      center: initLatLng,
    })),
    shareReplay(1)
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
            color: transportTypeColors[transportType],
          })
        )
      )
    );

  /**
   * We use "slow" currentTripLocations$ to show marker on the map, so it will
   * be visually is sync with the colored path. But in the beginning we show
   * one instant value, so the marker will be present from the first time the map is shown
   *
   * Observable is used for moving the marker, but also to provide data for the
   * "center map" button
   * */
  public currentLatLng$: Observable<LatLng> = concat(
    this.initialLatLng$,
    this.backgroundTrackingService.currentTripLocations$.pipe(
      map(_last),
      filter(negate(isNil)),
      map(locationToCoordinate)
    )
  );

  public currentLocationMarkerLayer$: Observable<Layer> =
    this.currentLatLng$.pipe(
      map(
        (coordinates) =>
          circleMarker(coordinates, {
            radius: 5, // px
            color: 'blue', // do we want to change colors by mean?
          })
        // marker(coordinates, {
        //   icon: icon({
        //     ...Icon.Default.prototype.options,
        //     iconUrl: 'assets/marker-icon.png',
        //     iconRetinaUrl: 'assets/marker-icon-2x.png',
        //     shadowUrl: 'assets/marker-shadow.png',
        //   }),
        // })
      )
    );

  public currentAccuracyMarkerLayers$: Observable<Layer> =
    this.currentLatLng$.pipe(
      withLatestFrom(this.backgroundTrackingService.accuracy$),
      map(([coordinates, accuracy]) =>
        circle(coordinates, {
          radius: accuracy, // in meters
          color: 'black',
          fillColor: 'black',
          fillOpacity: 0.1,
          weight: 1,
        })
      )
    );
  constructor(private backgroundTrackingService: BackgroundTrackingService) {}

  ngOnInit() {}

  onMapReady(mapInstance: Map) {
    (window as any).mapInstance = mapInstance;
    // TODO: invalidateSize on modal show event
    this.mapInstance = mapInstance;
    this.mapInstance.attributionControl.setPosition('bottomleft');
    setTimeout(() => {
      this.mapInstance.invalidateSize();
    }, 500);
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
        _last(fromTripPart.tripPartLocations),
        _first(toTripPart.tripPartLocations),
      ],
    })
  );
  // we do not really care about order, otherwise we would need to complicate it a little bit
  return _concat(tripPartsByTransportType, inBetweenTripParts);
}
type GroupedTripPart = {
  transportType: TransportType;
  tripPartLocations: TripLocation[];
};
