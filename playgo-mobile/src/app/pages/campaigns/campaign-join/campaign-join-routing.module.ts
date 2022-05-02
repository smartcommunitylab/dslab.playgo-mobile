import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignJoinPage } from './campaign-join.page';

const routes: Routes = [
  {
    path: '',
    component: CampaignJoinPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignJoinPageRoutingModule {}
