import { NgModule } from '@angular/core';

import { CampaignComponent } from './campaign.component';
import { AllCampaignModule } from '../campaigns/all-campaign/all-campaign.module';
import { MyCampaignModule } from '../campaigns/my-campaign/my-campaign.module';
import { PlayGoSharedLibsModule } from 'src/app/shared/shared-libs.module';
import { CampaignRoutingModule } from './campaign-routing.module';

@NgModule({
  imports: [
    PlayGoSharedLibsModule,
    AllCampaignModule,
    MyCampaignModule,
    CampaignRoutingModule,
    ],
  declarations: [CampaignComponent],
  exports: [CampaignComponent],
})
export class CampaignModule {}
