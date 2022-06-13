import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ERRORS } from '../../constants/error.constants';
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
    this.alertService.showToast({ messageString: errorFound.errorString });
  }
}
