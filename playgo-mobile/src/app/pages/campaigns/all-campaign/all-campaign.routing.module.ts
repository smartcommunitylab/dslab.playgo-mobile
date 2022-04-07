import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllCampaignComponent } from './all-campaign.component';

const routes: Routes = [
  {
    path: '',
    component: AllCampaignComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllCampaignPageRoutingModule {}
