/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FeatureGroup, Icon, LatLng, LayerGroup, Map, Marker, circle, icon, latLng, marker, polygon, tileLayer } from 'leaflet';
@Component({
  selector: 'app-company-map-modal',
  templateUrl: './company-map.modal.html',
  styleUrls: ['./company-map.modal.scss'],
})
export class CompanyMapModalPage implements OnInit {
  allLocations: any;
  selectedLocation: any;
  center: any;
  // mapFitToBounds: L.LatLngBounds;
  // mapFitToBoundsOptions: L.FitBoundsOptions;
  mapOptions: any = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, // for lower zooms there are no tiles!
        minZoom: 2,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 15,
    center: latLng([0.0, 0.0])
  };
  // radiusLayer: any;
  // placeLayer: any;
  sedi: FeatureGroup = new FeatureGroup();
  // itemsSedi: LayerGroup = new LayerGroup();

  constructor(private modalController: ModalController) { }
  ngOnInit() {
    // this.mapFitToBoundsOptions = { maxZoom: 12, animate: true };

  }
  onMapReady(map: Map) {
    this.initMap();
    map.invalidateSize();
    setTimeout(() => {
      map.fitBounds(this.sedi.getBounds());
      map.invalidateSize();
    }, 500);
  }


  initMap() {
    // this.mapOptions = {
    //   layers: [
    //     tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //       maxZoom: 19, // for lower zooms there are no tiles!
    //       minZoom: 10,
    //       attribution:
    //         '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    //     }),
    //   ],
    //   zoom: 15,
    //   center: latLng(this.center.latitute, this.center.longitute)
    // };
    for (const location of this.allLocations) {
      const newMarker = marker([location.latitude, location.longitude], {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        })
      });
      newMarker.addTo(this.sedi);
    }
  }
  close() {
    this.modalController.dismiss(false);
  }
}
