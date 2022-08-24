import { NgModule } from '@angular/core';
import { UserProfilePageRoutingModule } from './user-profile-routing.module';
import { UserProfilePage } from './user-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TransportStatComponent } from './transport-stat/transport-stat.component';
import { CampaignStatComponent } from './campaign-stat/campaign-stat.component';

@NgModule({
  imports: [PlayGoSharedModule, UserProfilePageRoutingModule],
  declarations: [
    UserProfilePage,
    TransportStatComponent,
    CampaignStatComponent,
  ],
})
export class UserProfilePageModule {}
