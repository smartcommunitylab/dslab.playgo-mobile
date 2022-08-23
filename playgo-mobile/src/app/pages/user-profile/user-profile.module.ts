import { NgModule } from '@angular/core';
import { UserProfilePageRoutingModule } from './user-profile-routing.module';
import { UserProfilePage } from './user-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, UserProfilePageRoutingModule],
  declarations: [UserProfilePage],
})
export class UserProfilePageModule {}
