import { NgModule } from '@angular/core';

import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LeaderboardPageRoutingModule } from './leaderboard-routing.module';
import { LeaderboardPage } from './leaderboard.page';
import { PlacingDetailComponent } from './placing-detail/placing-detail.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [LeaderboardPageRoutingModule, PlayGoSharedModule,IonicModule],
  declarations: [LeaderboardPage, PlacingDetailComponent],
})
export class LeaderboardModule {}
