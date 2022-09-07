import { NgModule } from '@angular/core';
import { CampaignDetailsPageRoutingModule } from './campaign-details-routing.module';
import { CampaignDetailsPage } from './campaign-details.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { DetailCampaignModalPage } from './detail-modal/detail.modal';
import { CampaignNotificationComponent } from './campaign-notification/campaign-notification.component';

@NgModule({
  imports: [CampaignDetailsPageRoutingModule, PlayGoSharedModule],
  declarations: [
    CampaignDetailsPage,
    DetailCampaignModalPage,
    CampaignNotificationComponent,
  ],
})
export class CampaignDetailsPageModule {}
