import { NgModule } from '@angular/core';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MyCampaignsWidgetComponent } from './my-campaigns-widget/my-campaigns-widget.component';
import { HomeTrackingWidgetComponent } from './home-tracking-widget/home-tracking-widget.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { HomeCampaignCityComponent } from './home-campaigns/home-campaign-city/home-campaign-city.component';
import { HomeCampaignPersonalComponent } from './home-campaigns/home-campaign-personal/home-campaign-personal.component';
import { HomeCampaignCompanyComponent } from './home-campaigns/home-campaign-company/home-campaign-company.component';
import { HomeCampaignSchoolComponent } from './home-campaigns/home-campaign-school/home-campaign-school.component';

@NgModule({
  imports: [PlayGoSharedModule, HomePageRoutingModule],
  declarations: [
    HomeCampaignCityComponent,
    HomeCampaignSchoolComponent,
    HomeCampaignCompanyComponent,
    HomeCampaignPersonalComponent,
    MyCampaignsWidgetComponent,
    HomeTrackingWidgetComponent,
    HomePage,
  ],
  exports: [MyCampaignsWidgetComponent, HomeTrackingWidgetComponent],
})
export class HomePageModule {}
