import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { NavController } from '@ionic/angular';
import { Notification } from 'src/app/core/api/generated/model/notification';
import { Browser } from '@capacitor/browser';
@Component({
  selector: 'app-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit, AfterViewInit {
  @Input()
  notification: Notification;
  public anchors: any;

  constructor(
    public navController: NavController,
    public renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    console.log(this.notification);
  }
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }

  public handleAnchorClick = (event: Event) => {
    // Prevent opening anchors the default way
    event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    Browser.open({
      url: anchor.href,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  };
}
