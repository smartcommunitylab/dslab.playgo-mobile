import { NgModule } from '@angular/core';
import { StatsTeamPageRoutingModule } from './stats-team-routing.module';
import { StatsTeamPage } from './stats-team.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, StatsTeamPageRoutingModule, IonicModule],
  declarations: [StatsTeamPage],
  providers: [LocalDatePipe],

})
export class StatsTeamPageModule { }
