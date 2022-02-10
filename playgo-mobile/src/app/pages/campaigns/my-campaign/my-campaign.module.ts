import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyCampaignComponent } from './my-campaign.component';
import { PlayGoSharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,PlayGoSharedModule],
  declarations: [MyCampaignComponent],
  exports: [MyCampaignComponent]
})
export class MyCampaignModule {}
