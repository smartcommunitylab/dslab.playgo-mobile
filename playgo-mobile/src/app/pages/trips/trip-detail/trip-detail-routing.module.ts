import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { TripDetailPage } from './trip-detail.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: TripDetailPage,
    data: {
      title: 'tripDetailTitle',
      defaultHref: '/pages/tabs/trips',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripDetailPageRoutingModule {}
