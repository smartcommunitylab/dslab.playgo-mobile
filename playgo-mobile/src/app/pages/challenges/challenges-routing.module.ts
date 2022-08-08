import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { ChallengesPage } from './challenges.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: ChallengesPage,
    data: {
      title: 'challenges.challenges',
      backButton: false,
      showPlayButton: true,
    },
  },
  {
    path: 'create-challenge',
    loadChildren: () => import('./create-challenge/create-challenge.module').then( m => m.CreateChallengePageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChallengesRoutingModule {}
