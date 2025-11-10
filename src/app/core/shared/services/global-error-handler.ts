import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private errorService: ErrorService) {}

  /**
   * We should never get here!
   *
   * There are two possibilities of what could went wrong:
   * 1. There is a javascript bug in the code, which needs to be fixed.
   * 2. There is a server error, which was not properly handled (by ErrorService).
   */
  public handleError(error: any) {
    const originalError = findOriginalError(error);
    // we can only guess what is correct here. We don't have any context. So let's be conservative.
    if (originalError instanceof HttpErrorResponse) {
      if (!environment.production) {
        console.error(
          'UNHANDLED HTTP ERROR!!\n' +
            'You should never get here!!\n' +
            'Catch server errors in service or in the component using ErrorService\n\n',
          error,
          '\n\nOriginal error:\n',
          originalError
        );
      }

      // it is hard to decide, if we want it to be silent or not.
      this.errorService.handleError(error, 'normal');
    } else {
      if (!environment.production) {
        console.error(
          'UNHANDLED ERROR!! (probably a javascript bug)\n\n',
          error,
          '\n\nOriginal error:\n',
          originalError
        );
      }

      this.errorService.handleError(error, 'silent');
    }
  }
}

/** from angular source code.. */
function findOriginalError(error: any): Error | null {
  let e = error;
  if (error?.rejection) {
    e = error.rejection;
  }
  while (getOriginalError(e)) {
    e = getOriginalError(e);
  }

  return e;
}

/** from angular source code.. */
function getOriginalError(error: Error): Error {
  return (error as any)?.ngOriginalError;
}
