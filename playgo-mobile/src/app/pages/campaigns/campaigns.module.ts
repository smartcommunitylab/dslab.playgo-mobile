import { NgModule } from '@angular/core';
import { CampaignsPage } from './campaigns.page';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { MyCampaignComponent } from './my-campaign/my-campaign.component';
import { AllCampaignComponent } from './all-campaign/all-campaign.component';

@NgModule({
  imports: [PlayGoSharedModule, CampaignsRoutingModule],
  declarations: [CampaignsPage, MyCampaignComponent, AllCampaignComponent],
})
export class CampaignsPageModule {}
