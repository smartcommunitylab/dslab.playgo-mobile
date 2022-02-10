import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'campaigns',
        children:[
          {
            path: '',
            loadChildren: () =>
              import('./campaigns/campaign.module').then((m) => m.CampaignModule),
          },
          {
            path: 'details/:id',
            loadChildren: () =>
              import('./campaigns/campaign-details/campaign-details.module').then((m) => m.CampaignDetailsPageModule),
          }
        ]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ]),
  ],
})
export class PagesRoutingModule {}
