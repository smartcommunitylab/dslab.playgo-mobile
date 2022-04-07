import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CampaignDetailsPageRoutingModule } from './campaign-details-routing.module';

import { CampaignDetailsPage } from './campaign-details.page';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CampaignDetailsPageRoutingModule,
    PlayGoSharedModule,
  ],
  declarations: [CampaignDetailsPage],
})
export class CampaignDetailsPageModule {}
