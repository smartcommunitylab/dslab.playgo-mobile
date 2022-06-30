import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { CampaignDetailsPage } from './campaign-details.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CampaignDetailsPage,
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
export class CampaignDetailsPageRoutingModule {}
