import { Component, Input, OnInit } from '@angular/core';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';

@Component({
  selector: 'app-limit-status',
  templateUrl: './limit-status.component.html',
  styleUrls: ['./limit-status.component.scss'],
})
export class LimitStatusComponent implements OnInit {
  @Input() limitMax?: any = undefined;
  @Input() limitValue?: any = undefined;
  @Input() type?: string;
  @Input() header?: string;
  constructor() {}

  ngOnInit() {
    console.log('limitMax' + this.limitMax + 'limitValue' + this.limitValue);
  }
}
