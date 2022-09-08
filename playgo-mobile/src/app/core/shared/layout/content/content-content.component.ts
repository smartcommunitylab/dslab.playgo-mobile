import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { map } from 'rxjs';
import { PageSettingsService } from '../../services/page-settings.service';
import { RefresherService } from '../../services/refresher.service';

@Component({
  selector: 'app-content-content',
  templateUrl: './content-content.component.html',
  styleUrls: ['./content-content.component.scss'],
})
export class ContentContentComponent implements OnInit {
  @ViewChild('template', { static: true })
  public template: TemplateRef<any>;

  public refresherDisabled$ = this.pageSettingsService.pageSettings$.pipe(
    map((settings) => !settings.refresher)
  );

  constructor(
    private refresherService: RefresherService,
    private pageSettingsService: PageSettingsService
  ) {}

  refresh(event: RefresherCustomEvent) {
    this.refresherService.onRefresh(event);
  }

  ngOnInit() {}
}
