import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutesWithPageSettings } from 'src/app/core/shared/services/page-settings.service';

import { RegistrationPage } from './registration.page';

const routes: RoutesWithPageSettings = [
  {
    path: '',
    component: RegistrationPage,
    data: {
      title: 'registration.title',
      customHeader: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationPageRoutingModule {}
