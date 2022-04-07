import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllCampaignComponent } from './all-campaign.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule],
  declarations: [AllCampaignComponent],
  exports: [AllCampaignComponent],
})
export class AllCampaignModule {}
