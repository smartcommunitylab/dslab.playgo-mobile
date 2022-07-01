import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  startWith,
  Subject,
  switchMap,
  scan,
  map,
  filter,
} from 'rxjs';
import { TranslateKey, XOR } from '../type.utils';

@Injectable({
  providedIn: 'root',
})
export class PageSettingsService {
  private defaultPageSettings: Required<PageSettings> = {
    title: '' as TranslateKey,
    backButton: true,
    color: 'playgo',
    defaultHref: '/',
    isOfflinePage: false,
    customHeader: false,
  };
  private routerPageSettings$: Observable<PageSettings> =
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(
        () =>
          getRouterDataFromRoute(this.activatedRoute) || ({} as PageSettings)
      )
    );

  private manualPageSettingsSubject: Subject<PageSettings> =
    new Subject<PageSettings>();

  public pageSettings$: Observable<Required<PageSettings>> =
    this.routerPageSettings$.pipe(
      // for every page we start from scratch
      switchMap((routerPageSettings) =>
        this.manualPageSettingsSubject.pipe(
          startWith({}),
          // apply all manual overrides for the current page
          scan(
            (settings, manualPageSettings) => ({
              ...settings,
              ...manualPageSettings,
            }),
            routerPageSettings
          ),
          // set defaults
          map((settings) => ({
            ...this.defaultPageSettings,
            ...settings,
          }))
        )
      )
    );

  private title$: Observable<TranslateKey> = this.pageSettings$.pipe(
    map((settings) => settings.title || 'home')
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService
  ) {
    this.title$.subscribe((title) => {
      this.titleService.setTitle(this.translateService.instant(title));
    });
  }

  public set(pageSettings: PageSettings) {
    this.manualPageSettingsSubject.next(pageSettings);
  }
}

function getRouterDataFromRoute(activatedRoute: ActivatedRoute): any {
  let child = activatedRoute.firstChild;
  while (child) {
    if (child.firstChild) {
      child = child.firstChild;
    } else if (child.snapshot.data) {
      return child.snapshot.data;
    } else {
      return null;
    }
  }
  return null;
}
export interface PageSettings {
  isOfflinePage?: boolean;
  // header
  title: TranslateKey | '';
  backButton?: boolean;
  color?: string;
  defaultHref?: string;
  customHeader?: boolean;
}

type PageRoute = Route & {
  data: PageSettings;
  component: Route['component'];
};

type NotPageRoute = Omit<Route, 'component'>;

export type RouteWithPageSettings = XOR<PageRoute, NotPageRoute>;
export type RoutesWithPageSettings = RouteWithPageSettings[];
