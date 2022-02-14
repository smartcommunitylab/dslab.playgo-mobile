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
    component: CampaignDetailsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignsRoutingModule {}
