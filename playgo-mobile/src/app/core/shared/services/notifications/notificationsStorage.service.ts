import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { Notification } from '../../../api/generated/model/notification';
@Injectable({
  providedIn: 'root',
})
export class NotificationStorageService {
  private storage =
    this.localStorageService.getStorageOf<Notification>('notifications');

  constructor(private localStorageService: LocalStorageService) {}
}
