import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { UserProfilePage } from './user-profile.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: UserProfilePage,
    data: {
      title: 'userprofile.title',
      customHeader: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfilePageRoutingModule {}
