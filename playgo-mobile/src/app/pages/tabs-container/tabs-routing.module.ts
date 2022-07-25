import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    data: {
      isOfflinePage: true,
    },
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'campaigns',
        loadChildren: () =>
          import('../campaigns/campaigns.module').then(
            (m) => m.CampaignsPageModule
          ),
      },
      {
        path: 'trips',
        loadChildren: () =>
          import('../trips/trips.module').then((m) => m.TripsPageModule),
      },
      {
        path: 'challenges',
        loadChildren: () =>
          import('../challenges/challenges.module').then(
            (m) => m.ChallengesPageModule
          ),
      },
      {
        path: 'offline',
        loadChildren: () =>
          import('../offline/offline.module').then((m) => m.OfflinePageModule),
      },
      {
        path: '',
        redirectTo: '/pages/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/pages/tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
