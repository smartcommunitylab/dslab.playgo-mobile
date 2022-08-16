import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, tap } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { NotificationService } from 'src/app/core/shared/services/notifications/notifications.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { Notification } from 'src/app/core/api/generated/model/notification';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  resetStackTabs = ['home', 'campaigns', 'trips', 'challenges'];
  challengesUnread = 0;
  unreadChallengeNotification$: Observable<Notification[]>;
  subUnread: Subscription;

  private url$ = this.router.events.pipe(
    filter((event: any) => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url),
    startWith(this.router.url)
  );

  public isHome$: Observable<boolean> = this.url$.pipe(
    map((url) => url.startsWith('/pages/tabs/home'))
  );
  constructor(
    private router: Router,
    public pageSettingsService: PageSettingsService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    this.unreadChallengeNotification$ = this.notificationService
      .getUnreadChallengeNotifications()
      .pipe(
        tap((notifications) => {
          console.log('unread campaign notification', notifications);
          this.challengesUnread = notifications.length;
          // this.cdRef.detectChanges();
        })
      );
    this.subUnread = this.unreadChallengeNotification$.subscribe();
  }
  ngOnDestroy(): void {
    this.subUnread.unsubscribe();
  }

  handleTabClick = (event: MouseEvent) => {
    const { tab } = event
      .composedPath()
      .find(
        (element: any) => element.tagName === 'ION-TAB-BUTTON'
      ) as EventTarget & { tab: string };

    if (this.resetStackTabs.includes(tab)) {
      this.router.navigate(['pages/tabs/' + tab]);
    }
  };
}
