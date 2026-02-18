import { NgModule } from '@angular/core';

import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { OtherGroupLeaderboardPageRoutingModule } from './other-groups-leaderboard-routing.module';
import { OtherGroupsLeaderboardPage } from './other-groups-leaderboard.page';
import { OtherPlacingDetailComponent } from './other-placing-detail/other-placing-detail.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [OtherGroupLeaderboardPageRoutingModule, PlayGoSharedModule,IonicModule],
  declarations: [OtherGroupsLeaderboardPage, OtherPlacingDetailComponent],
})
export class OtherGroupsLeaderboardPageModule {}
