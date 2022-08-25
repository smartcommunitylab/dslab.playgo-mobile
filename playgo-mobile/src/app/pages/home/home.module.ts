import { NgModule } from '@angular/core';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MyCampaignsWidgetComponent } from './my-campaigns-widget/my-campaigns-widget.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
@NgModule({
  imports: [PlayGoSharedModule, HomePageRoutingModule],
  declarations: [MyCampaignsWidgetComponent, HomePage],
  exports: [MyCampaignsWidgetComponent],
})
export class HomePageModule {}
