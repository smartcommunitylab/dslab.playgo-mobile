import { Component, OnInit } from '@angular/core';
import { MessageClass } from 'src/app/shared/classes/message-class';

@Component({
  selector: 'app-message-widget',
  templateUrl: './message-widget.component.html',
  styleUrls: ['./message-widget.component.scss'],
})
export class MessageWidgetComponent implements OnInit {

  messages: MessageClass[];
  constructor() { }

  ngOnInit() {}

}
