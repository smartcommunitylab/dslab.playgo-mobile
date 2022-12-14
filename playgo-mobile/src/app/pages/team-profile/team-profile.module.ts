import { NgModule } from '@angular/core';
import { TeamProfilePageRoutingModule } from './team-profile-routing.module';
import { TeamProfilePage } from './team-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, TeamProfilePageRoutingModule],
  declarations: [
    TeamProfilePage
  ],
})
export class TeamProfilePageModule { }
