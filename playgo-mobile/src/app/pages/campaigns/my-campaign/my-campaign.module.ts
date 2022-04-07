import { NgModule } from '@angular/core';
import { MyCampaignComponent } from './my-campaign.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule],
  declarations: [MyCampaignComponent],
  exports: [MyCampaignComponent]
})
export class MyCampaignModule { }
