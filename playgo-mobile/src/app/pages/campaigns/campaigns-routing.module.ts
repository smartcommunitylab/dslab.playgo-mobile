import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignDetailsPage } from './campaign-details/campaign-details.page';
import { CampaignsPage } from './campaigns.page';

const routes: Routes = [
  {
    path: '',
    component: CampaignsPage,
  },
  {
    path: 'details/:id',
    loadChildren: () =>
      import('./campaign-details/campaign-details.module').then(
        (m) => m.CampaignDetailsPageModule
      ),
  },
  {
    path: 'join/:id',
    loadChildren: () =>
      import('./campaign-join/campaign-join.module').then(
        (m) => m.CampaignJoinPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsRoutingModule {}
