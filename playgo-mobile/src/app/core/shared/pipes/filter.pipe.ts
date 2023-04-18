/*** PIPE ***/

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterData'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], field: any[], value: string): any[] {
    if (!items || !value || !field) {
      return items;
    }

    const lowSearch = value.toLowerCase();
    return items.filter((item) => field.some(key =>
      String(item[key]).toLowerCase().includes(lowSearch)
    ));
  }

}