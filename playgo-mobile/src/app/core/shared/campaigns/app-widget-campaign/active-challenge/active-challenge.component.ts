import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Challenge } from 'src/app/pages/challenges/challenges.page';
import { getImgChallenge } from '../../campaign.utils';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-active-challenge',
  templateUrl: './active-challenge.component.html',
  styleUrls: ['./active-challenge.component.scss'],
})
export class ActiveChallengeComponent implements OnInit, AfterViewInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  public anchors: any;

  imgChallenge = getImgChallenge;
  type = 'active';
  constructor(private elementRef: ElementRef) {}
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }
  ngOnInit() {}
  public handleAnchorClick = (event: Event) => {
    // Prevent opening anchors the default way
    event.preventDefault();
    const anchor = event.target as HTMLAnchorElement;
    Browser.open({
      url: anchor.href,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  };
}
