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
      showPlayButton: true,
    },
  },
  {
    path: 'leaderboard',
    loadChildren: () =>
      import('./leaderboard/leaderboard.module').then(
        (m) => m.LeaderboardModule
      ),
  },
  {
    path: 'school-leaderboard',
    loadChildren: () =>
      import('./school-leaderboard/school-leaderboard.module').then(
        (m) => m.SchoolLeaderboardPageModule
      ),
  },
  {
    path: 'stats',
    loadChildren: () =>
      import('./stats/stats.module').then((m) => m.StatsPageModule),
  },
  {
    path: 'badges',
    loadChildren: () =>
      import('./badges/badges.module').then((m) => m.BadgesPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignDetailsPageRoutingModule {}
