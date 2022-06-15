/* eslint-disable id-blacklist */
import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { isNil, negate } from 'lodash-es';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import {
  filter,
  map,
  first,
  scan,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Sort } from '../../api/generated/model/sort';
import { SwaggerPageable } from '../../api/generated/model/swaggerPageable';
import { asyncFilter, tapLog } from '../utils';
@Directive({
  selector: '[appInfiniteScrollContent]',
})
export class InfiniteScrollContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.scss'],
})
export class InfiniteScrollComponent<T> implements OnInit, AfterViewChecked {
  @ContentChild(InfiniteScrollContentDirective)
  content!: InfiniteScrollContentDirective;

  @ViewChild('infiniteScroll')
  private infiniteScrollComponent!: HTMLIonInfiniteScrollElement;

  @Input()
  public allItemsInTemplate = false;

  @Input()
  public set response(response: PageableResponse<T>) {
    this.response$.next(response);
    if (this.infiniteScrollComponent) {
      this.infiniteScrollComponent.complete();
    }
  }
  response$ = new Subject<PageableResponse<T>>();

  @Input()
  public set resetItems(resetItems: symbol) {
    this.resetItems$.next();
  }
  resetItems$ = new Subject<void>();

  private loadDataEvents$ = new Subject<void>();

  private afterViewChecked = new Subject<void>();
  private manualLoadWithNoScroll$ = this.response$.pipe(
    switchMap((response) => {
      if (!response) {
        return EMPTY;
      }
      const page = response.number + 1;
      const notAllDataIsLoaded = page < response.totalPages;
      return this.afterViewChecked.pipe(
        first(),
        asyncFilter(async () => {
          const noScroll = (await this.hasScroll()) === false;
          const shouldForceLoad = notAllDataIsLoaded && noScroll;
          return shouldForceLoad;
        })
      );
    }),
    tapLog(
      'Manually forced load of next page, because there is no scroll to trigger it'
    )
  );

  @Output()
  public request: Observable<PageableRequest> = merge(
    this.loadDataEvents$,
    this.manualLoadWithNoScroll$
  ).pipe(
    withLatestFrom(this.response$),
    map(([, response]) => {
      const page = response.number + 1;
      const size = response.size;
      if (page >= response.totalPages) {
        this.infiniteScrollComponent.disabled = true;
        return null;
      }
      this.infiniteScrollComponent.disabled = false;
      return { page, size };
    }),
    filter((request) => request !== null)
  );

  items$: Observable<T[]> = this.resetItems$.pipe(
    startWith(undefined as void),
    switchMap(() =>
      this.response$.pipe(
        filter(negate(isNil)),
        map((response) => response.content),
        scan((acc, curr) => [...acc, ...curr], []),
        startWith([])
      )
    )
  );

  /** For manual rendering */
  @Output()
  public items = this.items$;

  constructor(
    @Optional() @Inject(IonContent) private ionContentElement: IonContent
  ) {}

  loadData(event) {
    this.loadDataEvents$.next();
  }

  ngOnInit() {}

  ngAfterViewChecked() {
    this.afterViewChecked.next();
  }

  async hasScroll(): Promise<boolean | null> {
    if (!this.ionContentElement) {
      return null;
    }
    const scrollElement = await this.ionContentElement.getScrollElement();
    if (!scrollElement) {
      return null;
    }
    return scrollElement.scrollHeight > scrollElement.clientHeight;
  }
}

export interface PageableRequest {
  size?: number;
  page?: number;
}

export interface PageableResponse<T> {
  content?: T[];
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  pageable?: SwaggerPageable;
  size?: number;
  sort?: Sort;
  totalElements?: number;
  totalPages?: number;
}
