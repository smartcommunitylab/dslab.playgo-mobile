import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';
import { first, last } from 'lodash-es';
import { map } from 'rxjs/operators';
import { BackgroundTrackingService } from '../background-tracking.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private map: Leaflet.Map;
  private tripCoordinates =
    this.backgroundTrackingService.currentTripLocations.pipe(
      map((locations) =>
        locations.map(
          (tripLocation) =>
            [tripLocation.latitude, tripLocation.longitude] as [number, number]
        )
      )
    );

  constructor(private backgroundTrackingService: BackgroundTrackingService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.createMap();
  }
  /* only available in "route page" components?*/
  ionViewDidEnter() {}

  createMap() {
    this.map = Leaflet.map('mapId').setView([28.6448, 77.216721], 5);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'edupala.com © Angular LeafLet',
    }).addTo(this.map);

    Leaflet.marker([28.6, 77]).addTo(this.map).bindPopup('Delhi').openPopup();
    Leaflet.marker([34, 77]).addTo(this.map).bindPopup('Leh').openPopup();

    this.tripCoordinates.subscribe((tripCoords) => {
      tripCoords.forEach((coords) =>
        Leaflet.marker(coords)
          .addTo(this.map)
          .bindPopup('test' + tripCoords.length)
          .openPopup()
      );
      this.map.setView(last(tripCoords));
    });

    // antPath([[28.644800, 77.216721], [34.1526, 77.5771]],
    //   { color: '#FF0000', weight: 5, opacity: 0.6 })
    //   .addTo(this.map);
  }

  /** Remove map when we have multiple map object */
  ngOnDestroy() {
    this.map.remove();
  }
}
