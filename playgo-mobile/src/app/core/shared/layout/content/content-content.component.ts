import { Component, OnInit } from '@angular/core';
import { RefresherService } from '../../services/refresher.service';

@Component({
  selector: 'app-content-content',
  templateUrl: './content-content.component.html',
  styleUrls: ['./content-content.component.scss'],
})
export class ContentContentComponent implements OnInit {
  constructor(private refresherService: RefresherService) {}
  refresh() {
    this.refresherService.onRefresh();
  }
  ngOnInit() {}
}
