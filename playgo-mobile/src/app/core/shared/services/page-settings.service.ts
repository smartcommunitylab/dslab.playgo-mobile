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
import { XOR } from '../type.utils';
import { isInstanceOf } from '../utils';
import { TranslateKey } from '../globalization/i18n/i18n.utils';

/**
 * Page settings
 *
 * Service to manage page settings.
 * Manages common behavior which is shared between all pages.
 * Mainly behavior of the header (but not only).
 *
 * In order to change behavior of the ion-header we use `appHeader` directive.
 * See `header.directive.ts`.
 *
 * For changes in ion-content component we use `appContent` directive, for example
 * used to create global refresher. See `content.directive.ts`.
 *
 * Settings are defined in the router configuration. Data should by added to 'data' property of
 * route containing final component property (not loadChildren).
 * It is possible also to override them in the component using `pageSettingsService.set()`.
 *
 * Merged settings are available as an observable `pageSettings$`.
 *
 * There could be some problems with ionic, because ionic sometimes do not do real
 * router navigation but instead just show/hide page by css. Unfortunately, I was
 * not able to detect such changes. There are methods ionViewWillEnter and ionViewWillLeave
 * but they are on the level of the component, not the router / global events.
 */
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
    showPlayButton: true,
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

  private translatedTitle$: Observable<string> = this.pageSettings$.pipe(
    map((settings) => settings.title || 'home'),
    switchMap((title) => this.translateService.stream(title))
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService
  ) {
    this.translatedTitle$.subscribe((title) => {
      this.titleService.setTitle(title);
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
/** For defaults see private defaultPageSettings */
export interface PageSettings {
  /**
   * Used in OfflineGuard. Pages that are not offline pages will be redirected
   * to special offline page, if there is no connection
   * */
  isOfflinePage?: boolean;

  /**
   * Title of the page. Used in header and also as html title.
   * */
  title: TranslateKey | '';
  /**
   * If false, back button will not be shown in the header.
   * */
  backButton?: boolean;
  /**
   * Color of the header. Usually set dynamically by the page.
   * */
  color?: string;
  /**
   * defaultHref of back-button in header.
   * */
  defaultHref?: string;
  /**
   * Override to not render default header.
   * */
  customHeader?: boolean;
  /**
   * Show notifications button in header.
   * */
  showNotifications?: boolean;
  /**
   * Show start tracking button on the bottom of the page.
   * */
  showPlayButton?: boolean;
  /**
   * Enable refresher on the page. Note refresher is part of the content, not header.
   * So it is needed to add `appContent` directive to the ion-content component.
   * */
  refresher?: boolean;
}

type PageRoute = Route & {
  data: PageSettings;
  component: Route['component'];
};

type NotPageRoute = Omit<Route, 'component'>;

export type RouteWithPageSettings = XOR<PageRoute, NotPageRoute>;
export type RoutesWithPageSettings = RouteWithPageSettings[];
