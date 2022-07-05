import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, Observable, OperatorFunction, tap } from 'rxjs';
import { ERRORS } from '../../constants/error.constants';
import { TranslateKey } from '../type.utils';
import { getDebugStack, isOfflineError } from '../utils';
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

  getErrorHandler<T>(
    context: ErrorContextSeverity = 'normal'
  ): OperatorFunction<T, T> {
    //capture the stack trace, rxjs stacks are not helpful
    const originalStack = getDebugStack();

    return (source: Observable<T>) =>
      source.pipe(
        catchError((error) => {
          this.handleErrorInternal(error, context, originalStack);
          // return observable used for downstream subscription
          return EMPTY;
        })
      );
  }

  /**
   *
   * Universal error handler. Display toast/popup/logs based on severity and actual error.
   *
   * @param error error
   * @param context @see {@link ErrorContextSeverity}
   */
  handleError(error: any, context: ErrorContextSeverity = 'normal') {
    this.handleErrorInternal(error, context);
  }

  private handleErrorInternal(
    error: any,
    contextSeverity: ErrorContextSeverity = 'normal',
    stack?: string
  ) {
    // first let's check if error is "expected"
    const knownApplicationError = this.definedErrors.find(
      (definedError) => definedError.msg === error?.error?.ex
    );

    // if we want to handle offline error differently, than it should be done before
    // handleError was called.
    const isOffline = isOfflineError(error);

    const isExpectedError = knownApplicationError || isOffline;

    let messageTranslateKey: TranslateKey = 'errors.defaultErr';
    if (isExpectedError) {
      if (knownApplicationError) {
        messageTranslateKey = knownApplicationError.errorString;
      }
      if (isOffline) {
        messageTranslateKey = 'errors.offline';
      }
    }

    // if we want to, we can change severity based on error itself.
    const realSeverity = contextSeverity;

    if (realSeverity === 'silent') {
      console.warn('Error handled silently\n', error, stack);
    }
    if (realSeverity === 'normal') {
      console.error('Error handled by toast\n', error, stack);
      this.alertService.showToast({
        messageTranslateKey,
      });
    }
    if (realSeverity === 'blocking') {
      console.error('ERROR HANDLED BY FULL PAGE RELOAD!\n', error, stack);

      this.alertService
        .confirmAlert('errors.error_header', 'errors.not_recoverable')
        .then((shouldReload) => {
          if (shouldReload) {
            window.location.reload();
          }
        });
    }
  }
}

/**
 * 'silent' after this error, app can work with almost 100% functionality.
 * For example .sync failed - we can try later.
 *
 * 'normal' after this error, app can recover so at least main tracking is working.
 * For example leaderboard api failed. All button based calls...
 *
 * 'blocking' after this error, the tracking functionality is broken. For example
 * Territory (needed to get list of means) failed with 404.
 */
export type ErrorContextSeverity = 'silent' | 'normal' | 'blocking';

// ideas for another severities:
// 'page_blocking' - this page is broken, redirect home. For example failed load trip detail.
