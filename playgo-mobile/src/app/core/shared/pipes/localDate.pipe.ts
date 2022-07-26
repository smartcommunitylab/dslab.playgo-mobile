/**
 * Usage: dateString | localDate:'format'
 **/

import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
import { UserService } from '../services/user.service';

@Pipe({
  name: 'localDate',
  pure: false,
})
export class LocalDatePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: any, format?: string | Intl.DateTimeFormatOptions) {
    return this.format(value, format, this.userService.getLocale());
  }

  private format(
    value: any,
    format?: string | Intl.DateTimeFormatOptions,
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
}
