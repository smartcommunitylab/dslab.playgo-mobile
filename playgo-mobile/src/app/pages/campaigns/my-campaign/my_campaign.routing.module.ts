import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyCampaignComponent } from './my-campaign.component';

const routes: Routes = [
  {
    path: '',
    component: MyCampaignComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyCampaignPageRoutingModule {}
