import { NgModule } from '@angular/core';

import { TripsPageRoutingModule } from './trips-routing.module';

import { TripsPage } from './trips.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, TripsPageRoutingModule],
  declarations: [TripsPage],
})
export class TripsPageModule {}
