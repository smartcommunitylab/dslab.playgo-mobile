import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { TripDetailPage } from './trip-detail/trip-detail.page';
import { TripsPage } from './trips/trips.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'trips',
    component: TripsPage,
  },
  {
    path: 'trip-detail/:id',
    component: TripDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
