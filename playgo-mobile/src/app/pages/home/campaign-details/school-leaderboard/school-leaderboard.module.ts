import { NgModule } from '@angular/core';

import { SchoolLeaderboardPageRoutingModule } from './school-leaderboard-routing.module';

import { SchoolLeaderboardPage } from './school-leaderboard.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { SchoolPlacingDetailComponent } from './school-placing-detail/school-placing-detail.component';

@NgModule({
  imports: [SchoolLeaderboardPageRoutingModule, PlayGoSharedModule],
  declarations: [SchoolLeaderboardPage, SchoolPlacingDetailComponent],
})
export class SchoolLeaderboardPageModule { }
