import { NgModule } from '@angular/core';

import { TripsPageRoutingModule } from './trips-routing.module';

import { TripsPage } from './trips.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TripCardComponent } from './trip-card/trip-card.component';

@NgModule({
  imports: [PlayGoSharedModule, TripsPageRoutingModule],
  declarations: [TripsPage, TripCardComponent],
})
export class TripsPageModule {}
