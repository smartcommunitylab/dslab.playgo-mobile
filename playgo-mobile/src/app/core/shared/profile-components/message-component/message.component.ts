import { Component, OnInit } from '@angular/core';
import { MessageClass } from 'src/app/core/shared/model/message-class';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  messages: MessageClass[];
  constructor() {}

  ngOnInit() {}
}
