import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackingMapPageRoutingModule } from './tracking-map-routing.module';

import { TrackingMapPage } from './tracking-map.page';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CurrentLocationMapControlComponent } from './current-location-map-control/current-location-map-control.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TrackingMapPageRoutingModule,
    LeafletModule,
  ],
  declarations: [TrackingMapPage, CurrentLocationMapControlComponent],
})
export class TrackingMapPageModule {}
