/**
 * Usage: number | localNumber:'format'
 * If no format is provided 2 decimals will be used.
 **/

import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import { UserService } from '../services/user.service';
import { AbstractObservablePipe } from './abstractObservablePipe';
import { map, Observable } from 'rxjs';
import { ErrorService } from '../services/error.service';

@Pipe({
  name: 'localNumber',
  pure: false,
})
export class LocalNumberPipe
  extends AbstractObservablePipe<{ value: number; format?: string }, string>
  implements PipeTransform
{
  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private ref: ChangeDetectorRef
  ) {
    super(ref);
  }

  public transform(value: number, format?: string): string {
    return this.doTransform({ value, format });
  }

  protected transformToObservable(input: {
    value: number;
    format?: string;
  }): Observable<string> {
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
  private format(value: number, format: string, locale: string): string {
    if (value == null) {
      return '';
    }
    if (!format) {
      format = '.2-2';
    }

    return formatNumber(value, locale, format);
  }
}
