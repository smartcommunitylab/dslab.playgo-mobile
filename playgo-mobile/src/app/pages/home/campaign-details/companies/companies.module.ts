import { NgModule } from '@angular/core';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { CompaniesPageRoutingModule } from './companies-routing.module';
import { CompaniesCampaignPage } from './companies.page';
import { CompanyItemComponent } from './company-item/company-item.component';
import { CompanyDetailPage } from './company-detail-page/company-detail.page';
import { CompanyMapModalPage } from './company-detail-page/company-map/company-map.modal';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

@NgModule({
  imports: [PlayGoSharedModule, CompaniesPageRoutingModule, LeafletModule],
  declarations: [CompaniesCampaignPage, CompanyItemComponent, CompanyDetailPage, CompanyMapModalPage],
})
export class CompaniesPageModule { }
