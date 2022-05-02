import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  private url$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.url),
    startWith(this.router.url)
  );

  private currentPageInfo$: Observable<{ isHome: boolean; isMap: boolean }> =
    this.url$.pipe(
      map((url: string) => {
        const isHome = url.startsWith('/pages/tabs/home');
        const isMap = url.startsWith('/pages/tabs/home/tracking-map');
        return {
          isHome,
          isMap,
        };
      })
    );

  public showTrackingButtons$ = this.currentPageInfo$.pipe(
    map(({ isHome, isMap }) => !isHome && !isMap)
  );

  public showFooter$ = this.currentPageInfo$.pipe(
    map(({ isHome, isMap }) => !isMap)
  );

  constructor(private router: Router) {}
}
