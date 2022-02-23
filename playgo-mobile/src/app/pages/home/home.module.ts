import { NgModule } from '@angular/core';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, HomePageRoutingModule],
  declarations: [HomePage],
})
export class HomePageModule {}
