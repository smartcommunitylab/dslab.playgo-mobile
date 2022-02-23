import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignsPage } from './campaigns.page';

const routes: Routes = [
  {
    path: '',
    component: CampaignsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsRoutingModule {}
