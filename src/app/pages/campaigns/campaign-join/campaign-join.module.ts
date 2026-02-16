import { NgModule } from '@angular/core';
import { CampaignJoinPageRoutingModule } from './campaign-join-routing.module';
import { CampaignJoinPage } from './campaign-join.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { JoinCompanyModalPage } from './join-company/join-company.modal';
import { JoinCityModalPage } from './join-city/join-city.modal';
import { JoinSchoolModalPage } from './join-school/join-school.modal';
import { IonicModule } from '@ionic/angular';
import { JoinGroupModalPage } from './join-group/join-group.modal';

@NgModule({
  imports: [CampaignJoinPageRoutingModule, PlayGoSharedModule,IonicModule],
  declarations: [
    CampaignJoinPage,
    JoinCompanyModalPage,
    JoinCityModalPage,
    JoinGroupModalPage,
    JoinSchoolModalPage  ],
})
export class CampaignJoinPageModule {}
