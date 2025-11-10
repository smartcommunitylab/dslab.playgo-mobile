import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';
import { CompaniesCampaignPage } from './companies.page';
import { CompanyDetailPage } from './company-detail-page/company-detail.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: CompaniesCampaignPage,
    data: {
      title: 'campaigns.campaignmodal.listTitle',
    },
  },
  {
    path: ':id',
    component: CompanyDetailPage,
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
