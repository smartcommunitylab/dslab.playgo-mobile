import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { CompaniesPageRoutingModule } from './companies-routing.module';
import { CompaniesCampaignPage } from './companies.page';

@NgModule({
  imports: [PlayGoSharedModule, CompaniesPageRoutingModule],
  declarations: [CompaniesCampaignPage],
})
export class CompaniesPageModule { }
