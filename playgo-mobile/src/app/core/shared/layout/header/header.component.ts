import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AppStatusService } from '../../services/app-status.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() backButton = true;
  @Input() color = 'playgo';
  @Input() defaultHref = '/';

  isOnline$: Observable<boolean> = this.appStatusService.isOnline$;

  constructor(
    private navCtrl: NavController,
    private appStatusService: AppStatusService
  ) {
    this.isOnline$.subscribe((isOnline) => {
      console.log('isOnline', isOnline);
    });
  }

  ngOnInit() {}
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
