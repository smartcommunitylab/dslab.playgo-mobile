import { NgModule } from '@angular/core';
import { StatsTeamPageRoutingModule } from './stats-team-routing.module';
import { StatsTeamPage } from './stats-team.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';

@NgModule({
  imports: [PlayGoSharedModule, StatsTeamPageRoutingModule],
  declarations: [StatsTeamPage],
  providers: [LocalDatePipe],

})
export class StatsTeamPageModule { }
