import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RefresherService } from '../../services/refresher.service';

@Component({
  selector: 'app-content-content',
  templateUrl: './content-content.component.html',
  styleUrls: ['./content-content.component.scss'],
})
export class ContentContentComponent implements OnInit {
  @ViewChild('template', { static: true })
  public template: TemplateRef<any>;

  constructor(private refresherService: RefresherService) {}
  refresh() {
    this.refresherService.onRefresh();
  }
  ngOnInit() {}
}
