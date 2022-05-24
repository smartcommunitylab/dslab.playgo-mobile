import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() backButton = true;
  @Input() color = 'playgo';
  @Input() parallaxUrlImg: string;
  @Input() defaultHref = '/';
  @Input() content: any;
  constructor(private navCtrl: NavController) { }

  ngOnInit() { }
  ngOnChanges() {
    console.log(this.title);
  }
  back() {
    if (this.defaultHref) {
      return this.navCtrl.navigateRoot(this.defaultHref);
    }
    return this.navCtrl.back();
  }
}
