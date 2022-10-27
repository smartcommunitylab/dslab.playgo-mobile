import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { CompaniesCampaignPage } from './companies.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CompaniesCampaignPage,
    data: {
      title: 'campaigns.campaignmodal.title',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompaniesPageRoutingModule { }
