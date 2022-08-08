import { NgModule } from '@angular/core';

import { CreateChallengePageRoutingModule } from './create-challenge-routing.module';

import { CreateChallengePage } from './create-challenge.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, CreateChallengePageRoutingModule],
  declarations: [CreateChallengePage],
})
export class CreateChallengePageModule {}
