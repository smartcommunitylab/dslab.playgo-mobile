import { NgModule } from '@angular/core';
import { CampaignsPage } from './campaigns.page';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { MyCampaignModule } from './my-campaign/my-campaign.module';
import { AllCampaignModule } from './all-campaign/all-campaign.module';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [
    PlayGoSharedModule,
    CampaignsRoutingModule,
    MyCampaignModule,
    AllCampaignModule,
  ],
  declarations: [CampaignsPage],
})
export class CampaignsPageModule {}
