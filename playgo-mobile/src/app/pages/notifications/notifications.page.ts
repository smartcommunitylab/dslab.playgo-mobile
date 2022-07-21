import { Component, OnInit } from '@angular/core';
import { Subject, Observable, switchMap, startWith } from 'rxjs';
import { CommunicationAccountControllerService } from 'src/app/core/api/generated/controllers/communicationAccountController.service';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ErrorService } from 'src/app/core/shared/services/error.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  scrollRequestSubject = new Subject<PageableRequest>();
  notificationsScrollResponse$: Observable<PageCampaignPlacing> =
    this.scrollRequestSubject.pipe(
      startWith({
        page: 0,
        size: 10,
      }),
      switchMap(({ page, size }) =>
        this.communicationAccountControllerService
          .getPlayerNotificationsUsingGET({
            since: 0,
            skip: page,
            limit: size,
          })
          .pipe(this.errorService.getErrorHandler())
      )
    );
  constructor(
    private communicationAccountControllerService: CommunicationAccountControllerService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {}
}

function bind<F extends (...args: any) => any>(f: F, thisValue: any): F {
  return (f as any).bind(thisValue);
}
