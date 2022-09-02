import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefresherService {
  private refreshSubject = new Subject<void>();

  public refreshed$: Observable<void> = this.refreshSubject.asObservable();

  public onRefresh(event: Event): void {
    this.refreshSubject.next();
  }
}
