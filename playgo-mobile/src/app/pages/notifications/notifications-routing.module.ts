import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { NotificationsPage } from './notifications.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: NotificationsPage,
    data: {
      title: 'notifications_title',
      backButton: true,
      showPlayButton: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsPageRoutingModule {}
