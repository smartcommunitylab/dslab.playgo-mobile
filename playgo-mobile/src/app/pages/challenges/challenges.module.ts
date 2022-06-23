import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { ChallengessRoutingModule } from './challenges-routing.module';
import { ChallengesPage } from './challenges.page';

@NgModule({
  imports: [PlayGoSharedModule, ChallengessRoutingModule],
  declarations: [ChallengesPage],
})
export class ChallengesPageModule {}
