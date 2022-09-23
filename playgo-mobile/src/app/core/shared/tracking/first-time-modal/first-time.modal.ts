import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-first-time',
  templateUrl: './first-time.modal.html',
  styleUrls: ['./first-time.modal.scss'],
})
export class FirstTimeBackgrounModalPage implements OnInit, AfterViewInit {
  public anchors: any;

  constructor(
    private elementRef: ElementRef,
    private modalController: ModalController
  ) {}
  ngAfterViewInit() {}

  ngOnInit() {}
  accept() {
    this.modalController.dismiss(true);
  }
  close() {
    this.modalController.dismiss(false);
  }
}
