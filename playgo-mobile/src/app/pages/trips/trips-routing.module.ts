import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { TripsPage } from './trips.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: TripsPage,
    data: {
      title: 'tripsTitle',
      backButton: false,
      isOfflinePage: true,
      showPlayButton: true,
      refresher: true,
    },
  },
  {
    path: 'campaign/:id',
    component: TripsPage,
    data: {
      title: 'tripsTitle',
      defaultHref: '/pages/tabs/home/profile',
      backButton: true,
      isOfflinePage: true,
      showPlayButton: true,
      refresher: true,
    },
  },
  {
    path: 'trip/:id',
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
