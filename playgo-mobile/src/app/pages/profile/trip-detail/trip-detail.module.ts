import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripDetailPageRoutingModule } from './trip-detail-routing.module';

import { TripDetailPage } from './trip-detail.page';
import { TripDetailMapComponent } from '../trip-detail-map/trip-detail-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripDetailPageRoutingModule,
  ],
  declarations: [TripDetailPage, TripDetailMapComponent],
})
export class TripDetailPageModule {}
