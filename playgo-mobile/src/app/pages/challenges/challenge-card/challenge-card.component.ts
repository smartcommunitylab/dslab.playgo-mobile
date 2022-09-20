import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';
import { getImgChallenge } from '../../../core/shared/utils';
import { Browser } from '@capacitor/browser';
import { DetailChallengenModalPage } from './detail-modal/detail.modal';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
})
export class ChallengeCardComponent implements OnInit, AfterViewInit {
  @Input() challenge: Challenge;
  @Input() type: string;
  public anchors: any;

  imgChallenge = getImgChallenge;
  constructor(
    public campaignService: CampaignService,
    private elementRef: ElementRef,
    private modalController: ModalController
  ) {}
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }
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
  ngOnInit() {}

  fillSurvey() {
    Browser.open({
      url: this.challenge.extUrl,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  getUnitChallenge(challenge: Challenge) {
    return challenge?.unit?.toLowerCase().includes('km'.toLowerCase());
  }
  async moreInfo() {
    const modal = await this.modalController.create({
      component: DetailChallengenModalPage,
      componentProps: {
        challenge: this.challenge,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
}
