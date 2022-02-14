import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabComponent } from './tab.component';

const routes: Routes = [
  {
    path: '',
    component: TabComponent,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../../pages/home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () =>
            import('../../pages/home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () =>
            import('../../pages/campaigns/campaign.module').then(m => m.CampaignModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabPageRoutingModule { }
