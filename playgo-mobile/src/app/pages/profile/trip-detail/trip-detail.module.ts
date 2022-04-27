import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripDetailPageRoutingModule } from './trip-detail-routing.module';

import { TripDetailPage } from './trip-detail.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TripDetailMapComponent } from '../trip-detail-map/trip-detail-map.component';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
@NgModule({
  imports: [PlayGoSharedModule, TripDetailPageRoutingModule, LeafletModule],
  declarations: [TripDetailPage, TripDetailMapComponent],
})
export class TripDetailPageModule {}
