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
    if (!value) {
      return '';
    }
    if (!format) {
      format = 'shortDate';
    }
    if (typeof format !== 'string') {
      try {
        return Intl.DateTimeFormat(this.userService.getLocale(), format).format(
          value
        );
      } catch (e) {
        // fallback if there is some problem with Intl
        return formatDate(value, 'shortDate', this.userService.getLocale());
      }
    }
    // basic string format
    return formatDate(value, format, this.userService.getLocale());
  }
}
