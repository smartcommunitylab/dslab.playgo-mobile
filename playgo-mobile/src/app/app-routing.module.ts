import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './shared/auth/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  {
    path: 'pages',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/pages-routing.module').then( m => m.PagesRoutingModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule) },
  {
    path: 'auth/callback',
   loadChildren: () => import('./auth/auth-callback/auth-callback.module').then(m => m.AuthCallbackPageModule)
  },
  { path: 'auth/endsession',
   loadChildren: () => import('./auth/end-session/end-session.module').then(m => m.EndSessionPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
