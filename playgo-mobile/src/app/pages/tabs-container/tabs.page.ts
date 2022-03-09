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

  public isHome$: Observable<boolean> = this.url$.pipe(
    map((url) => url.startsWith('/pages/tabs/home'))
  );
  constructor(private router: Router) {}
}
