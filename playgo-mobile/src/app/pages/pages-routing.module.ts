import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        loadChildren: () =>
          import('./tabs-container/tabs.module').then((m) => m.TabsPageModule),
      },
      {
        path: 'registration',
        loadChildren: () =>
          import('./registration/registration.module').then(
            (m) => m.RegistrationPageModule
          ),
      },
    ]),
  ],
})
export class PagesRoutingModule {}
