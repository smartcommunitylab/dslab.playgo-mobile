import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { SchoolLeaderboardPage } from './school-leaderboard.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: SchoolLeaderboardPage,
    data: {
      title: 'leaderboard.title',
      color: 'school',
      backButton: true
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolLeaderboardPageRoutingModule { }
