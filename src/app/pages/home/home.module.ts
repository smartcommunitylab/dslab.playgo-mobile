import { NgModule } from '@angular/core';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { MyCampaignsWidgetComponent } from './my-campaigns-widget/my-campaigns-widget.component';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { AboutModalComponent } from './profile/about-modal/about-modal.component';
import { FooterComponent } from './footer/footer.component';
import { CreditsModalComponent } from './footer/credits-modal/credits-modal.component';
import { IonicModule } from '@ionic/angular';
@NgModule({
  imports: [PlayGoSharedModule, HomePageRoutingModule,IonicModule],
  declarations: [MyCampaignsWidgetComponent,
    AboutModalComponent, HomePage, FooterComponent,
    CreditsModalComponent],
  exports: [MyCampaignsWidgetComponent],
})
export class HomePageModule { }
