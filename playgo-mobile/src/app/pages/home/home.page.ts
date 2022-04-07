import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService, IAuthAction, AuthActions } from 'ionic-appauth';
import { Subscription } from 'rxjs';
import { CampaignClass } from 'src/app/core/shared/campaigns/classes/campaign-class';
// import { UserClass } from 'src/app/core/shared/classes/user';
import { LocalStorageService } from 'src/app/core/shared/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  user$ = this.auth.user$;
  events$ = this.auth.events$;
  sub!: Subscription;
  campaigns?: CampaignClass[];

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  // ngOnInit() {
  //   this.user = new UserClass();
  //   this.user.img_source = 'https://www.atuttodonna.it/atuttodonna/wp-content/uploads/2020/04/immagini-felicit%C3%A0.jpg';
  //   this.user.name = 'My name';
  //   this.user.totalLeaf = '42';
  //   const a = new CampaignClass();
  //   a.name = 'ciao';
  //   const b = new CampaignClass();
  //   b.name = 'hola';
  //   const c = new CampaignClass();
  //   c.name = 'hello';
  //   this.campaigns = [a, b, c];
  // }

  campagins() {
    this.router.navigateByUrl('/campaigns');
  }

  public signOut() {
    this.auth.signOut();
  }

  public async getUserInfo(): Promise<void> {
    this.auth.loadUserInfo();
  }

  public async refreshToken(): Promise<void> {
    this.auth.refreshToken();
  }

  ngOnInit() {
    this.sub = this.auth.events$.subscribe((action) =>
      this.onSignOutSuccess(action)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onSignOutSuccess(action: IAuthAction) {
    if (action.action === AuthActions.SignOutSuccess) {
      this.localStorageService.clearUser();
      this.navCtrl.navigateRoot('login');
    }
  }
}
