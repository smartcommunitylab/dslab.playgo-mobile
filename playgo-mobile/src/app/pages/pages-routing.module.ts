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
        path: 'stats/:id',
        loadChildren: () =>
          import('./stats/stats.module').then((m) => m.StatsPageModule),
      },
      {
        path: 'blacklist/:id',
        loadChildren: () =>
          import('./blacklist/blacklist.module').then(
            (m) => m.BlacklistPageModule
          ),
      },
      {
        path: 'badges/:id',
        loadChildren: () =>
          import('./badges/badges.module').then((m) => m.BadgesPageModule),
      },
      {
        path: 'user-profile/:id',
        loadChildren: () =>
          import('./user-profile/user-profile.module').then(
            (m) => m.UserProfilePageModule
          ),
      },
    ]),
  ],
})
export class PagesRoutingModule {}
