import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavController } from '@ionic/angular';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit {
  @Input()
  notification: Notification;

  constructor(
    private sanitizer: DomSanitizer,
    public navController: NavController,
    public renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    console.log(this.notification);
  }
  public getHtmlWithBypassedSecurity(code: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(code);
  }
  ionViewDidLoad() {
    const link = this.elRef.nativeElement.querySelector('a');
    this.renderer.listen(link, 'click', () => {
      Browser.open({ url: link });
      return false;
    });
  }
}
