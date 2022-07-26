/**
 * Usage: {'en':'hi', 'it': 'Ciao'} | languageMap
 **/

import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { UserService } from '../services/user.service';
import { AbstractObservablePipe } from './abstractObservablePipe';
import { map, Observable } from 'rxjs';
import { ErrorService } from '../services/error.service';
import { has } from 'lodash-es';

@Pipe({
  name: 'languageMap',
  pure: false,
})
export class LanguageMapPipe
  extends AbstractObservablePipe<LanguageMap, string>
  implements PipeTransform, OnDestroy
{
  constructor(
    private userService: UserService,
    private errorService: ErrorService,
    private ref: ChangeDetectorRef
  ) {
    super(ref);
  }
  ngOnDestroy(): void {
    super.destroy();
  }

  public transform(value: Record<string, string>): string {
    return this.doTransform(value as LanguageMap);
  }

  protected transformToObservable(input: LanguageMap): Observable<string> {
    return this.userService.userLanguage$.pipe(
      map((language) => {
        try {
          return this.format(input, language);
        } catch (e) {
          this.errorService.handleError(e, 'silent');
          return '';
        }
      })
    );
  }
  private format(value: LanguageMap, language: Language): string {
    const languagesToTry: Language[] = [language, 'en', 'it'];

    const applicableLanguage = languagesToTry.find((eachLanguage) =>
      has(value, eachLanguage)
    );
    return applicableLanguage ? value[applicableLanguage] : '';
  }
}

type LanguageMap = Record<Language, string>;

type Language = 'en' | 'it';
