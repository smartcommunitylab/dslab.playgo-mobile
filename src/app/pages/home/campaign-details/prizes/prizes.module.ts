import { NgModule } from '@angular/core';
import { PrizesPageRoutingModule } from './prizes-routing.module';
import { PrizesPage } from './prizes.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { LocalDatePipe } from 'src/app/core/shared/pipes/localDate.pipe';
import { PrizeModalPage } from './prize-modal/prize.modal';
import { DetailPrizeModalPage } from './detail-modal/detail.modal';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, PrizesPageRoutingModule, IonicModule],
  declarations: [PrizesPage, PrizeModalPage, DetailPrizeModalPage],
  providers: [LocalDatePipe],

})
export class PrizesPageModule { }
