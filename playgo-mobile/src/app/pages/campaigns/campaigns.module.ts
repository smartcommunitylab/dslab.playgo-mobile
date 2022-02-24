import { NgModule } from '@angular/core';
import { CampaignsPage } from './campaigns.page';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { TrackingModule } from 'src/app/core/shared/tracking/tracking.module';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [TrackingModule, PlayGoSharedModule, CampaignsRoutingModule],
  declarations: [CampaignsPage],
})
export class CampaignsPageModule {}
