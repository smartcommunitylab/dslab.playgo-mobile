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
  constructor(private user: UserService) { }

  transform(value: any, format?: string) {
    if (!value) {
      return '';
    }
    if (!format) {
      format = 'shortDate';
    }

    return formatDate(value, format, this.user.locale);
  }
}
