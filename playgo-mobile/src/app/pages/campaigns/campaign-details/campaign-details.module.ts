import { NgModule } from '@angular/core';
import { CampaignDetailsPageRoutingModule } from './campaign-details-routing.module';
import { CampaignDetailsPage } from './campaign-details.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { DetailCampaignModalPage } from './detail-modal/detail.modal';

@NgModule({
  imports: [CampaignDetailsPageRoutingModule, PlayGoSharedModule],
  declarations: [CampaignDetailsPage, DetailCampaignModalPage],
})
export class CampaignDetailsPageModule {}
