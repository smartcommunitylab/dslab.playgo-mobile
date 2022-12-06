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
      {
        path: 'notifications',
        loadChildren: () =>
          import('./notifications/notifications.module').then(
            (m) => m.NotificationsPageModule
          ),
      },
      {
        path: 'blacklist/:id',
        loadChildren: () =>
          import('./blacklist/blacklist.module').then(
            (m) => m.BlacklistPageModule
          ),
      },

      {
        path: 'user-profile/:id/:nickname',
        loadChildren: () =>
          import('./user-profile/user-profile.module').then(
            (m) => m.UserProfilePageModule
          ),
      },
      {
        path: 'team-profile/:initiativeId/:teamId',
        loadChildren: () =>
          import('./team-profile/team-profile.module').then(
            (m) => m.TeamProfilePageModule
          ),
      },
    ]),
  ],
})
export class PagesRoutingModule { }
