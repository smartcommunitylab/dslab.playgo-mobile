import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TripsPage } from './trips.page';

const routes: Routes = [
  {
    path: '',
    component: TripsPage,
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./trip-detail/trip-detail.module').then(
        (m) => m.TripDetailPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripsPageRoutingModule {}
