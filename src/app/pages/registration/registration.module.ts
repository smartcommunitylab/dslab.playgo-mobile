import { NgModule } from '@angular/core';
import { RegistrationPageRoutingModule } from './registration-routing.module';
import { RegistrationPage } from './registration.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { PrivacyModalPage } from './privacy-modal/privacy.modal';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [PlayGoSharedModule, RegistrationPageRoutingModule,IonicModule],
  declarations: [RegistrationPage, PrivacyModalPage],
})
export class RegistrationPageModule {}
