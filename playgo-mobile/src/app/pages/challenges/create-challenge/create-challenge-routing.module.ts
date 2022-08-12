import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { CreateChallengePage } from './create-challenge.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CreateChallengePage,
    data: {
      title: 'challenges.create.title',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateChallengePageRoutingModule {}
