import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, Observable, OperatorFunction } from 'rxjs';
import { ERRORS } from '../../constants/error.constants';
import { getDebugStack } from '../utils';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private definedErrors = ERRORS;
  constructor(
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  showAlert(error: any) {
    let errorFound: any = this.definedErrors.find(
      (definedError) => definedError.msg === error?.error?.ex
    );
    if (!errorFound) {
      errorFound = {
        errorString: 'errors.defaultErr',
      };
    }
    this.alertService.showToast({
      messageTranslateKey: errorFound.errorString,
    });
  }
  showAlertOnError<T>(): OperatorFunction<T, T> {
    //capture the stack trace
    const originalStack = getDebugStack();

    return (source: Observable<T>) =>
      source.pipe(
        catchError((error) => {
          console.warn(
            'Error caught and alert shown!',
            error,
            'Original stack',
            originalStack
          );
          this.showAlert(error);
          // return observable used for downstream subscription
          return EMPTY;
        })
      );
  }
}
