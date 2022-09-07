import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { CampaignsPage } from './campaigns.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CampaignsPage,
    data: {
      title: 'campaigns_title',
      backButton: false,
      showPlayButton: true,
    },
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
