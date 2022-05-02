import { NgModule } from '@angular/core';
import { CampaignJoinPageRoutingModule } from './campaign-join-routing.module';
import { CampaignJoinPage } from './campaign-join.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [
    CampaignJoinPageRoutingModule,
    PlayGoSharedModule,
  ],
  declarations: [CampaignJoinPage],
})
export class CampaignJoinPageModule { }
