import { NgModule } from '@angular/core';
import { TeamProfilePageRoutingModule } from './team-profile-routing.module';
import { TeamProfilePage } from './team-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, TeamProfilePageRoutingModule,IonicModule],
  declarations: [
    TeamProfilePage
  ],
})
export class TeamProfilePageModule { }
