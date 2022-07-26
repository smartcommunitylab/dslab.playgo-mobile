/**
 * Usage: dateString | localDate:'format'
 **/

import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { UserService } from '../services/user.service';
import { takeUntil, map, Subject, switchMap, distinctUntilChanged } from 'rxjs';
import { isEqual } from 'lodash-es';
import { ErrorService } from '../services/error.service';

@Pipe({
  name: 'localDate',
  pure: false,
})
export class LocalDatePipe implements PipeTransform, OnDestroy {
  private pipeIsDestroyed$ = new Subject<void>();

  private requestsToTransformSubject = new Subject<{
    value: any;
    format: Format;
  }>();
  private formattedValue$ = this.requestsToTransformSubject.pipe(
    distinctUntilChanged(isEqual),
    switchMap((request) =>
      this.userService.userLocale$.pipe(
        map((locale) => {
          try {
            return this.format(request.value, request.format, locale);
          } catch (e) {
            this.errorService.handleError(e, 'silent');
            return '';
          }
        })
      )
    ),
    takeUntil(this.pipeIsDestroyed$)
  );

  private formattedValue: string = null;

  constructor(
    private userService: UserService,
    private ref: ChangeDetectorRef,
    private errorService: ErrorService
  ) {
    this.formattedValue$.subscribe((formattedValue) => {
      this.formattedValue = formattedValue;
      // We actually do not have any means to output asynchronously value from the pipe,
      // so we force the change detection, and pipe will be re-evaluated. At this point we have
      // this.formattedValue set, and we will output it in the pipe. To avoid infinite loop, we use
      // distinctUntilChanged operator.
      this.ref.markForCheck();
    });
  }

  public transform(value: any, format?: Format) {
    this.requestsToTransformSubject.next({ value, format });
    return this.formattedValue;
  }

  private format(value: any, format?: Format, locale?: string): string {
    if (!value) {
      return '';
    }
    if (!format) {
      format = 'shortDate';
    }
    if (typeof format !== 'string') {
      try {
        return Intl.DateTimeFormat(locale, format).format(value);
      } catch (e) {
        // fallback if there is some problem with Intl
        return formatDate(value, 'shortDate', locale);
      }
    }
    // basic string format
    return formatDate(value, format, locale);
  }

  ngOnDestroy() {
    this.pipeIsDestroyed$.next();
    this.pipeIsDestroyed$.complete();
  }
}

type Format = string | Intl.DateTimeFormatOptions;
