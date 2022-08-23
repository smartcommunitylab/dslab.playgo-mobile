import { NgModule } from '@angular/core';
import { UserProfilePageRoutingModule } from './user-profile-routing.module';
import { UserProfilePage } from './user-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TransportStatComponent } from './transport-stat/transport-stat.component';

@NgModule({
  imports: [PlayGoSharedModule, UserProfilePageRoutingModule],
  declarations: [UserProfilePage, TransportStatComponent],
})
export class UserProfilePageModule {}
