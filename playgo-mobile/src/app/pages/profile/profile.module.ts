import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, ProfilePageRoutingModule],
  declarations: [ProfilePage],
})
export class ProfilePageModule {}
