import { NgModule } from '@angular/core';
import { TeamProfilePageRoutingModule } from './team-profile-routing.module';
import { TeamProfilePage } from './team-profile.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { TransportStatComponent } from './transport-stat/transport-stat.component';
import { CampaignStatComponent } from './campaign-stat/campaign-stat.component';

@NgModule({
  imports: [PlayGoSharedModule, TeamProfilePageRoutingModule],
  declarations: [
    TeamProfilePage,
    TransportStatComponent,
    CampaignStatComponent,
  ],
})
export class TeamProfilePageModule { }
