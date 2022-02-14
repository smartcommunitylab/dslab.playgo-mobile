import { NgModule } from '@angular/core';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';
import { MyCampaignsWidgetComponent } from './my-campaigns-widget/my-campaigns-widget.component';
import { HomeTrackingWidgetComponent } from './home-tracking-widget/home-tracking-widget.component';


@NgModule({
  imports: [
    PlayGoSharedModule,
    HomePageRoutingModule,
  ],
  declarations: [
    MyCampaignsWidgetComponent,
    HomeTrackingWidgetComponent,
    HomePage],
    exports: [MyCampaignsWidgetComponent,
      HomeTrackingWidgetComponent]
})
export class HomePageModule {}
