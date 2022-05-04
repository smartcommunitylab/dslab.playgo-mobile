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
  @Input() color = 'primary';
  constructor(private navCtrl: NavController) { }

  ngOnInit() { }
  ngOnChanges() {
    console.log(this.title);
  }
  back() {
    this.navCtrl.back();
  }
}
