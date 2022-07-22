import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { ProfilePage } from './profile.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: ProfilePage,
    data: {
      title: 'profileTitle',
      backButton: true,
      isOfflinePage: true,
      showPlayButton: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
