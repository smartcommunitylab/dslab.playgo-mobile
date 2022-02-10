
import { NgModule } from '@angular/core';
import { CampaignsPage } from './campaigns.page';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    PlayGoSharedModule,
    CampaignsRoutingModule
  ],
  declarations: [CampaignsPage]
})
export class CampaignsPageModule { }
