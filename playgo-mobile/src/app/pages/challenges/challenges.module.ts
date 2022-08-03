import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { ChallengeCardComponent } from './challenge-card/challenge-card.component';
import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChallengesPage } from './challenges.page';

@NgModule({
  imports: [PlayGoSharedModule, ChallengesRoutingModule],
  declarations: [ChallengesPage, ChallengeCardComponent],
})
export class ChallengesPageModule {}
