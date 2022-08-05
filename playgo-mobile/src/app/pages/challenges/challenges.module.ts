import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { ChallengeBarStatusComponent } from './challenge-card/challenge-bar-status/challenge-bar-status.component';
import { ChallengeCardComponent } from './challenge-card/challenge-card.component';
import { ChallengeUsersStatusComponent } from './challenge-card/challenge-users-status/challenge-users-status.component';
import { ChallengeContainerComponent } from './challenge-container/challenge-container.component';
import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChallengesPage } from './challenges.page';

@NgModule({
  imports: [PlayGoSharedModule, ChallengesRoutingModule],
  declarations: [
    ChallengesPage,
    ChallengeCardComponent,
    ChallengeContainerComponent,
    ChallengeBarStatusComponent,
    ChallengeUsersStatusComponent,
  ],
})
export class ChallengesPageModule {}
