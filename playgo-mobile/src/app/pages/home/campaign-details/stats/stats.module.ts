import { NgModule } from '@angular/core';
import { StatsPageRoutingModule } from './stats-routing.module';
import { StatsPage } from './stats.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';

@NgModule({
  imports: [PlayGoSharedModule, StatsPageRoutingModule],
  declarations: [StatsPage],
  providers: [LocalDatePipe],

})
export class StatsPageModule { }
