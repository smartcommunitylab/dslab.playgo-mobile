import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { CampaignJoinPage } from './campaign-join.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CampaignJoinPage,
    data: {
      title: '',
      customHeader: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignJoinPageRoutingModule {}
