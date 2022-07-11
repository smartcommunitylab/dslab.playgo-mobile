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
    },
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
  {
    path: 'leaderboard/:id',
    loadChildren: () =>
      import('./leaderboard/leaderboard.module').then(
        (m) => m.LeaderboardModule
      ),
  },
  {
    path: 'school-leaderboard',
    loadChildren: () => import('./school-leaderboard/school-leaderboard.module').then( m => m.SchoolLeaderboardPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignsRoutingModule {}
