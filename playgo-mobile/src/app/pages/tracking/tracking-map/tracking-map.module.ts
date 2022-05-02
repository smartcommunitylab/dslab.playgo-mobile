import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackingMapPageRoutingModule } from './tracking-map-routing.module';

import { TrackingMapPage } from './tracking-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackingMapPageRoutingModule
  ],
  declarations: [TrackingMapPage]
})
export class TrackingMapPageModule {}
