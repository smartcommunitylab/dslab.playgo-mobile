import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-challenges',
  templateUrl: 'challenges.page.html',
  styleUrls: ['challenges.page.scss'],
})
export class ChallengesPage implements OnInit, OnDestroy {
  selectedSegment?: string;
  constructor() {}

  ngOnInit(): void {
    this.selectedSegment = 'activeChallenges';
  }
  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }
  ngOnDestroy(): void {}
}
