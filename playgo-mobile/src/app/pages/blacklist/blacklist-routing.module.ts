import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { BlacklistPage } from './blacklist.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: BlacklistPage,
    data: {
      title: 'blacklist.blacklist',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlacklistPageRoutingModule {}
