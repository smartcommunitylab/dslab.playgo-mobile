import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackingMapPageRoutingModule } from './tracking-map-routing.module';

import { TrackingMapPage } from './tracking-map.page';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CurrentLocationMapControlComponent } from './current-location-map-control/current-location-map-control.component';
import { SharedTrackingModule } from 'src/app/core/shared/tracking/shared-tracking.module';
import { PlayGoSharedLibsModule } from 'src/app/core/shared/shared-libs.module';

@NgModule({
  imports: [
    TrackingMapPageRoutingModule,
    PlayGoSharedLibsModule,
    LeafletModule,
    SharedTrackingModule,
  ],
  declarations: [TrackingMapPage, CurrentLocationMapControlComponent],
})
export class TrackingMapPageModule {}
