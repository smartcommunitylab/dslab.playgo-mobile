import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { FaqPageRoutingModule } from './faq-routing.module';
import { FaqPage } from './faq.page';

@NgModule({
  imports: [PlayGoSharedModule, FaqPageRoutingModule],
  declarations: [FaqPage],
})
export class FaqPageModule { }
