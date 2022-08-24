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
  extends AbstractObservablePipe<LanguageMap<any>, any>
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

  public transform<O>(value: Record<string, O>): O {
    return this.doTransform(value as LanguageMap<O>) as O;
  }

  protected transformToObservable<O>(input: LanguageMap<O>): Observable<O> {
    return this.userService.userLanguage$.pipe(
      map((language) => {
        try {
          return this.format(input, language);
        } catch (e) {
          this.errorService.handleError(e, 'silent');
          return null;
        }
      })
    );
  }
  private format<O>(value: LanguageMap<O>, language: Language): O {
    const languagesToTry: Language[] = [language, 'en', 'it'];

    const applicableLanguage = languagesToTry.find((eachLanguage) =>
      has(value, eachLanguage)
    );
    return applicableLanguage ? value[applicableLanguage] : null;
  }
}
export type LanguageMap<O> = Record<Language, O>;
export type StringLanguageMap = LanguageMap<string>;

type Language = 'en' | 'it';
