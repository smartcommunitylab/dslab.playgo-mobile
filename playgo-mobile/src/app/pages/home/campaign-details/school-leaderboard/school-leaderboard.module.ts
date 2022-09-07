import { NgModule } from '@angular/core';

import { SchoolLeaderboardPageRoutingModule } from './school-leaderboard-routing.module';

import { SchoolLeaderboardPage } from './school-leaderboard.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [SchoolLeaderboardPageRoutingModule, PlayGoSharedModule],
  declarations: [SchoolLeaderboardPage],
})
export class SchoolLeaderboardPageModule {}
