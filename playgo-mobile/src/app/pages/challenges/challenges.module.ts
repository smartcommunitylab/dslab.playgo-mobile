import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { ChallengeCardComponent } from './challenge-card/challenge-card.component';
import { ChallengeContainerComponent } from './challenge-container/challenge-container.component';
import { ChallengesProposedCardComponent } from './challenges-proposed-card/challenges-proposed-card.component';
import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChalengeSingleStatComponent } from './challenges-stat/challenge-single-stat/challenge-single-stat.component';
import { ChallengesStatComponent } from './challenges-stat/challenges-stat.component';
import { ChallengesPage } from './challenges.page';
import { CoupleChallengeProposedComponent } from './couple-challenge-proposed/couple-challenge-proposed.component';
import { InvitationlModalPage } from './couple-challenge-proposed/invitation-challenge/invitation-challenge.modal';
import { CreateChallengeButtonComponent } from './create-challenge-button/create-challenge-button.component';
import { SentInvitationlModalPage } from './create-challenge/sent-invitation-modal/sent-invitation.modal';
import { SingleChallengeProposedComponent } from './single-challenge-proposed/single-challenge-proposed.component';
import { SingleProposalModalPage } from './single-challenge-proposed/single-proposal/single-proposal.modal';

@NgModule({
  imports: [PlayGoSharedModule, ChallengesRoutingModule],
  declarations: [
    ChallengesPage,
    ChallengeCardComponent,
    ChallengeContainerComponent,
    ChallengesStatComponent,
    CreateChallengeButtonComponent,
    ChalengeSingleStatComponent,
    ChallengesProposedCardComponent,
    CoupleChallengeProposedComponent,
    SingleChallengeProposedComponent,
    InvitationlModalPage,
    SingleProposalModalPage,
    SentInvitationlModalPage,
  ],
})
export class ChallengesPageModule {}
