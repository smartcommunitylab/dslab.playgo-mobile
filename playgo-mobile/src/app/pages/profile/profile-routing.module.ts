import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { TripDetailPage } from './trip-detail/trip-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'trips',
    loadChildren: () =>
      import('./trips/trips.module').then((m) => m.TripsPageModule),
  },
  {
    path: 'trip-detail/:id',
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
export class ProfilePageRoutingModule {}
