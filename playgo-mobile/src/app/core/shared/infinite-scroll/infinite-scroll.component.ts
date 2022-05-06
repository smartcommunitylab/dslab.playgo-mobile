/* eslint-disable id-blacklist */
import {
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { isNil, negate } from 'lodash-es';
import { Observable, Subject } from 'rxjs';
import {
  filter,
  map,
  scan,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { Sort } from '../../api/generated/model/sort';
import { SwaggerPageable } from '../../api/generated/model/swaggerPageable';
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
export class InfiniteScrollComponent<T> implements OnInit {
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

  private loadDataEvents$ = new Subject<IonicLoadDataEvent>();

  @Output()
  public request: Observable<PageableRequest> = this.loadDataEvents$.pipe(
    withLatestFrom(this.response$),
    map(([event, response]) => {
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

  constructor() {}

  loadData(event) {
    this.loadDataEvents$.next(event);
  }

  ngOnInit() {}
}

interface IonicLoadDataEvent {}

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
