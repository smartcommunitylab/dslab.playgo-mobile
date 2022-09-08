import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ActivationEnd,
  NavigationEnd,
  Route,
  Router,
  RoutesRecognized,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  startWith,
  Subject,
  switchMap,
  scan,
  map,
  tap,
  filter,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  shareReplay,
  of,
  concat,
  merge,
  race,
} from 'rxjs';
import { isEqual } from 'lodash-es';
import { TranslateKey, XOR } from '../type.utils';
import { isInstanceOf, tapLog } from '../utils';

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
    showNotifications: false,
    showPlayButton: false,
    refresher: false,
  };
  private routerPageSettings$: Observable<PageSettings> = merge(
    this.router.events.pipe(
      filter(isInstanceOf(RoutesRecognized)),
      map((event) => ({
        id: event.id,
        settings: getRouterDataFromActivatedRouteSnapshot(event.state.root),
      }))
    ),
    this.router.events.pipe(
      filter(isInstanceOf(NavigationEnd)),
      map((event) => ({
        id: event.id,
        settings: getRouterDataFromActivatedRoute(this.activatedRoute),
      }))
    )
  ).pipe(
    distinctUntilKeyChanged('id'),
    map(({ settings }) => settings)
  );

  private manualPageSettingsSubject = new Subject<Partial<PageSettings>>();

  public pageSettings$: Observable<Required<PageSettings>> =
    this.routerPageSettings$.pipe(
      // for every page we start from scratch
      switchMap((routerPageSettings) =>
        concat(of({}), this.manualPageSettingsSubject).pipe(
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
          })),
          distinctUntilChanged(isEqual)
        )
      ),
      shareReplay()
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

  public set(pageSettings: Partial<PageSettings>) {
    this.manualPageSettingsSubject.next(pageSettings);
  }
}

function getRouterDataFromActivatedRouteSnapshot(
  activatedRouteSnapshot: ActivatedRouteSnapshot
): PageSettings {
  let child = activatedRouteSnapshot.firstChild;
  while (child) {
    if (child.firstChild) {
      child = child.firstChild;
    } else if (child.data) {
      return child.data as PageSettings;
    } else {
      return {} as PageSettings;
    }
  }
  return {} as PageSettings;
}
function getRouterDataFromActivatedRoute(
  activatedRoute: ActivatedRoute
): PageSettings {
  let child = activatedRoute.firstChild;
  while (child) {
    if (child.firstChild) {
      child = child.firstChild;
    } else if (child.snapshot.data) {
      return child.snapshot.data as PageSettings;
    } else {
      return {} as PageSettings;
    }
  }
  return {} as PageSettings;
}
export interface PageSettings {
  isOfflinePage?: boolean;
  // header
  title: TranslateKey | '';
  backButton?: boolean;
  color?: string;
  defaultHref?: string;
  customHeader?: boolean;
  showNotifications?: boolean;
  // footer
  showPlayButton?: boolean;
  refresher?: boolean;
}

type PageRoute = Route & {
  data: PageSettings;
  component: Route['component'];
};

type NotPageRoute = Omit<Route, 'component'>;

export type RouteWithPageSettings = XOR<PageRoute, NotPageRoute>;
export type RoutesWithPageSettings = RouteWithPageSettings[];
