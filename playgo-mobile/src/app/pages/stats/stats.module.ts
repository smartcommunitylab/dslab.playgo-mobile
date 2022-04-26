import { NgModule } from '@angular/core';
import { StatsPageRoutingModule } from './stats-routing.module';
import { StatsPage } from './stats.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, StatsPageRoutingModule],
  declarations: [StatsPage],
})
export class StatsPageModule { }
