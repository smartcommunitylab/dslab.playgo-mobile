import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { StatsPage } from './stats.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: StatsPage,
    data: {
      title: 'report.stats.title',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsPageRoutingModule {}
