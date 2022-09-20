import { NgModule } from '@angular/core';
import { RegistrationPageRoutingModule } from './registration-routing.module';
import { RegistrationPage } from './registration.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';
import { PrivacyModalPage } from './privacy-modal/privacy.modal';

@NgModule({
  imports: [PlayGoSharedModule, RegistrationPageRoutingModule],
  declarations: [RegistrationPage, PrivacyModalPage],
})
export class RegistrationPageModule {}
