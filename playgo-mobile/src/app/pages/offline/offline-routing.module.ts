import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { OfflinePage } from './offline.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: OfflinePage,
    data: {
      title: 'offline_page.title',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfflinePageRoutingModule {}
