import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignClass } from 'src/app/shared/campaigns/classes/campaign-class';
import { UserClass } from 'src/app/shared/classes/user';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  user?: UserClass;
  campaigns?: CampaignClass[];

  constructor(private router: Router) {}

  ngOnInit(){
    this.user = new UserClass();
    this.user.img_source = 'https://www.atuttodonna.it/atuttodonna/wp-content/uploads/2020/04/immagini-felicit%C3%A0.jpg';
    this.user.name = 'My name';
    this.user.totalLeaf = '42';
    const a = new CampaignClass();
    a.name='ciao';
    const b = new CampaignClass();
    b.name='hola';
    const c = new CampaignClass();
    c.name='hello';
    this.campaigns = [a,b,c];
  }

  campagins(){
    this.router.navigateByUrl('/campaigns');
  }

}
