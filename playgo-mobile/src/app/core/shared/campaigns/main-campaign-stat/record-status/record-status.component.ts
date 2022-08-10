import { Component, Input, OnInit } from '@angular/core';
import { TransportStat } from 'src/app/core/api/generated/model/transportStat';

@Component({
  selector: 'app-record-status',
  templateUrl: './record-status.component.html',
  styleUrls: ['./record-status.component.scss'],
})
export class RecordStatusComponent implements OnInit {
  @Input() status?: any = undefined;
  @Input() record?: TransportStat = undefined;
  @Input() type?: string;
  constructor() {}

  ngOnInit() {}
}
