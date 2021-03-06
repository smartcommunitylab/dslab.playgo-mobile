import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './core/auth/auth-guard.service';
import { OfflineGuard } from './core/shared/services/offline.guard';
import { RoutesWithPageSettings } from './core/shared/services/page-settings.service';

const routes: RoutesWithPageSettings = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  {
    path: 'pages',
    canActivate: [AuthGuardService, OfflineGuard],
    canActivateChild: [OfflineGuard],
    loadChildren: () =>
      import('./pages/pages-routing.module').then((m) => m.PagesRoutingModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth-pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'auth/callback',
    loadChildren: () =>
      import('./auth-pages/auth-callback/auth-callback.module').then(
        (m) => m.AuthCallbackPageModule
      ),
  },
  {
    path: 'auth/endsession',
    loadChildren: () =>
      import('./auth-pages/end-session/end-session.module').then(
        (m) => m.EndSessionPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
