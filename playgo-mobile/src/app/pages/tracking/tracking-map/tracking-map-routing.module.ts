import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackingMapPage } from './tracking-map.page';

const routes: Routes = [
  {
    path: '',
    component: TrackingMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackingMapPageRoutingModule {}
