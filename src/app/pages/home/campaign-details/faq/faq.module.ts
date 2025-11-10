import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { FaqPageRoutingModule } from './faq-routing.module';
import { FaqPage } from './faq.page';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, FaqPageRoutingModule, IonicModule],
  declarations: [FaqPage],
})
export class FaqPageModule { }
