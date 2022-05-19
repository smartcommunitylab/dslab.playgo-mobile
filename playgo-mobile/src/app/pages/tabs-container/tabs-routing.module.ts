import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
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
export class TabsPageRoutingModule { }
