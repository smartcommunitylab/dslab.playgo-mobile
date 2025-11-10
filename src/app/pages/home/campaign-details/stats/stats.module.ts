import { NgModule } from '@angular/core';
import { StatsPageRoutingModule } from './stats-routing.module';
import { StatsPage } from './stats.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, StatsPageRoutingModule, IonicModule],
  declarations: [StatsPage],
  providers: [LocalDatePipe],

})
export class StatsPageModule { }
