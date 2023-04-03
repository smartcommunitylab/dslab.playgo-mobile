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
      backButton: true,
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
    path: 'prizes',
    loadChildren: () =>
      import('./prizes/prizes.module').then((m) => m.PrizesPageModule),
  },
  {
    path: 'stats',
    loadChildren: () =>
      import('./stats/stats.module').then((m) => m.StatsPageModule),
  },
  {
    path: 'stats-team',
    loadChildren: () =>
      import('./stats-team/stats-team.module').then((m) => m.StatsTeamPageModule),
  },
  {
    path: 'faq',
    loadChildren: () =>
      import('./faq/faq.module').then((m) => m.FaqPageModule),
  },
  {
    path: 'badges',
    loadChildren: () =>
      import('./badges/badges.module').then((m) => m.BadgesPageModule),
  },
  {
    path: 'companies',
    loadChildren: () =>
      import('./companies/companies.module').then((m) => m.CompaniesPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignDetailsPageRoutingModule { }
