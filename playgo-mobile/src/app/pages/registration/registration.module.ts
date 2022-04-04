import { NgModule } from '@angular/core';
import { RegistrationPageRoutingModule } from './registration-routing.module';
import { RegistrationPage } from './registration.page';
import { PlayGoSharedModule } from 'src/app/core/shared/shared.module';

@NgModule({
  imports: [PlayGoSharedModule, RegistrationPageRoutingModule],
  declarations: [RegistrationPage],
})
export class RegistrationPageModule {}
