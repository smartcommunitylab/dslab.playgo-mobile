import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { StatsTeamPage } from './stats-team.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: StatsTeamPage,
    data: {
      title: 'report.stats.title_team',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsTeamPageRoutingModule { }
