import { Component, OnInit } from '@angular/core';
import { Subject, Observable, switchMap, startWith } from 'rxjs';
import { CommunicationAccountControllerService } from 'src/app/core/api/generated/controllers/communicationAccountController.service';
import { PageCampaignPlacing } from 'src/app/core/api/generated/model/pageCampaignPlacing';
import { PageNotification } from 'src/app/core/api/generated/model/pageNotification';
import { PageableRequest } from 'src/app/core/shared/infinite-scroll/infinite-scroll.component';
import { ErrorService } from 'src/app/core/shared/services/error.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { tapLog } from '../../core/shared/utils';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  constructor(public pageSettingsService: PageSettingsService) {}

  ngOnInit() {}
}
