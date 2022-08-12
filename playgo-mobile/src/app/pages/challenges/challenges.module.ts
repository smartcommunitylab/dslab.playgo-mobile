import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { ChallengeCardComponent } from './challenge-card/challenge-card.component';
import { ChallengeContainerComponent } from './challenge-container/challenge-container.component';
import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChallengesStatComponent } from './challenges-stat/challenges-stat.component';
import { ChallengesPage } from './challenges.page';

@NgModule({
  imports: [PlayGoSharedModule, ChallengesRoutingModule],
  declarations: [
    ChallengesPage,
    ChallengeCardComponent,
    ChallengeContainerComponent,
    ChallengesStatComponent,
  ],
})
export class ChallengesPageModule {}
