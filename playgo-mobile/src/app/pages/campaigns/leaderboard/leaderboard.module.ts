import { NgModule } from '@angular/core';

import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LeaderboardPageRoutingModule } from './leaderboard-routing.module';
import { LeaderboardPage } from './leaderboard.page';

@NgModule({
  imports: [LeaderboardPageRoutingModule, PlayGoSharedModule],
  declarations: [LeaderboardPage],
})
export class LeaderboardModule { }
