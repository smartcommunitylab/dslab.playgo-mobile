/**
 * Usage: date | localDate:'format'
 **/

import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { UserService } from '../services/user.service';
import { map, Observable } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { AbstractObservablePipe } from './abstractObservablePipe';

@Pipe({
  name: 'localDate',
  pure: false,
})
export class LocalDatePipe
  extends AbstractObservablePipe<Input, string>
  implements PipeTransform, OnDestroy
{
  constructor(
    private userService: UserService,
    private ref: ChangeDetectorRef,
    private errorService: ErrorService
  ) {
    super(ref);
  }

  public transform(value: any, format?: Format) {
    return this.doTransform({ value, format });
  }

  /**
   * @override
   */
  protected transformToObservable(input: Input): Observable<string> {
    return this.userService.userLocale$.pipe(
      map((locale) => {
        try {
          return this.format(input.value, input.format, locale);
        } catch (e) {
          this.errorService.handleError(e, 'silent');
          return '';
        }
      })
    );
  }

  private format(
    value: number | Date,
    format?: Format,
    locale?: string
  ): string {
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
    super.destroy();
  }
}
type Input = {
  value: number | Date;
  format?: Format;
};
type Format = string | Intl.DateTimeFormatOptions;
