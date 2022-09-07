import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { HomePage } from './home.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: HomePage,
    data: {
      title: 'home',
      isOfflinePage: true,
      showNotifications: true,
      backButton: false,
      showPlayButton: true,
    },
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'details/:id',
    loadChildren: () =>
      import('./campaign-details/campaign-details.module').then(
        (m) => m.CampaignDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
