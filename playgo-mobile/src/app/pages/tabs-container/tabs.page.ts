import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  resetStackTabs = ['home', 'campaigns', 'trips', 'challenge'];

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
    public pageSettingsService: PageSettingsService
  ) {}

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
