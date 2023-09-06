/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FeatureGroup, Icon, Map, icon, latLng, marker, tileLayer } from 'leaflet';
@Component({
  selector: 'app-company-map-modal',
  templateUrl: './company-map.modal.html',
  styleUrls: ['./company-map.modal.scss'],
})
export class CompanyMapModalPage implements OnInit {
  allLocations: any;
  selectedLocation: any;
  center: any;
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

  sedi: FeatureGroup = new FeatureGroup();

  constructor(private modalController: ModalController) { }
  ngOnInit() {

  }
  onMapReady(map: Map) {
    this.initMap();
    map.invalidateSize();
    setTimeout(() => {
      map.fitBounds(this.sedi.getBounds());
      map.invalidateSize();
      this.sedi.eachLayer((layer: any) => {
        if (layer._latlng.lat === this.selectedLocation.latitude &&
          layer._latlng.lng === this.selectedLocation.longitude) {
          layer.openPopup();
        }
      });
    }, 500);
  }


  initMap() {
    for (const location of this.allLocations) {
      const newMarker = marker([location.latitude, location.longitude], {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
        })
      }).bindPopup(`
      <div><span style="font-weight:bold">${location.id}</span></div>
      <div><span style="font-style:italic">${location.address} ${location.streetNumber}</span></div>
      `);
      newMarker.addTo(this.sedi);
    }

  }
  close() {
    this.modalController.dismiss(false);
  }
}
