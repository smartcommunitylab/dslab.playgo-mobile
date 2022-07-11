import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchoolLeaderboardPageRoutingModule } from './school-leaderboard-routing.module';

import { SchoolLeaderboardPage } from './school-leaderboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchoolLeaderboardPageRoutingModule
  ],
  declarations: [SchoolLeaderboardPage]
})
export class SchoolLeaderboardPageModule {}
