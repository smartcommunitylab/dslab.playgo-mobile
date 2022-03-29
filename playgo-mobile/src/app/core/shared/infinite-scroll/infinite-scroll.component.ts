import {
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

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

  @Input()
  public set response(response: PageableResponse<T>) {
    this.response$.next(response);
  }
  response$ = new Subject<PageableResponse<T>>();

  @Output()
  public request = new EventEmitter<PageableRequest>();

  public numTimesLeft = 100;

  public items$: Observable<T[]> = this.response$.pipe(
    map((response) => response.content)
  );

  constructor() {}

  loadData(event) {
    this.request.emit({});
  }

  ngOnInit() {}
}

export interface PageableRequest {}

export interface PageableResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}
