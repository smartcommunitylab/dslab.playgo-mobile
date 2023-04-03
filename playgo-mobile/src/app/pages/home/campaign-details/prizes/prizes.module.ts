import { NgModule } from '@angular/core';
import { PrizesPageRoutingModule } from './prizes-routing.module';
import { PrizesPage } from './prizes.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';

@NgModule({
  imports: [PlayGoSharedModule, PrizesPageRoutingModule],
  declarations: [PrizesPage],
  providers: [LocalDatePipe],

})
export class PrizesPageModule { }
