import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { TeamProfilePage } from './team-profile.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: TeamProfilePage,
    data: {
      title: 'teamprofile.title',
      backButton: true,
      showPlayButton: true,
      color: 'school'
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamProfilePageRoutingModule { }
