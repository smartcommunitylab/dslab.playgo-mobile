import { NgModule } from '@angular/core';
import { CampaignDetailsPageRoutingModule } from './campaign-details-routing.module';
import { CampaignDetailsPage } from './campaign-details.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { DetailCampaignModalPage } from './detail-modal/detail.modal';
import { CampaignNotificationComponent } from './campaign-notification/campaign-notification.component';
import { UnsubscribeModalPage } from './unsubscribe-modal/unsubscribe.modal';
import { CompaniesCampaignModalPage } from './companies-modal/companies.modal';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [CampaignDetailsPageRoutingModule, PlayGoSharedModule, IonicModule],
  declarations: [
    CampaignDetailsPage,
    DetailCampaignModalPage,
    CompaniesCampaignModalPage,
    CampaignNotificationComponent,
    UnsubscribeModalPage,
  ],
})
export class CampaignDetailsPageModule {}
