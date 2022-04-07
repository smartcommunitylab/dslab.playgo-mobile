import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-tracking-widget',
  templateUrl: './home-tracking-widget.component.html',
  styleUrls: ['./home-tracking-widget.component.scss'],
})
export class HomeTrackingWidgetComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  startTraking(mean: string) {
    console.log('start trasking for', mean);
  }
}
