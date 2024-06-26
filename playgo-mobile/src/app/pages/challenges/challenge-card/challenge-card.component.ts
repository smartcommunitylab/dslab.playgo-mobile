import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { Challenge } from '../challenges.page';
import { Browser } from '@capacitor/browser';
import { DetailChallengenModalPage } from './detail-modal/detail.modal';
import { ModalController } from '@ionic/angular';
import { getImgChallenge, getTypeStringChallenge } from 'src/app/core/shared/campaigns/campaign.utils';
import { TranslateService } from '@ngx-translate/core';
import { RefresherService } from 'src/app/core/shared/services/refresher.service';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { Observable } from 'rxjs';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { TeamService } from 'src/app/core/shared/services/team.service';

@Component({
  selector: 'app-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
})
export class ChallengeCardComponent implements OnInit, AfterViewInit {

  @Input() campaignContainer: PlayerCampaign;
  @Input() challenge: Challenge;
  @Input() type: string;
  @Input() team?: boolean = false;
  public anchors: any;
  otherTeam$: Observable<PlayerTeam>;
  imgChallenge = getImgChallenge;
  constructor(
    public campaignService: CampaignService,
    private elementRef: ElementRef,
    private modalController: ModalController,
    private translateService: TranslateService,
    private refresherService: RefresherService,
    private teamService: TeamService
  ) { }
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
  ngOnInit() {
    if (this.team && this.challenge?.otherAttendeeData) {
      this.otherTeam$ = this.teamService.getPublicTeam(
        this.campaignContainer?.campaign?.campaignId,
        this.challenge?.otherAttendeeData.playerId
      )
    };


  }
  typeChallenge(kind: string, type: string, other: boolean) {
    return (kind === "team" ? (other ? this.translateService.instant('challenges.challenge_model.name.teams') : this.translateService.instant('challenges.challenge_model.name.default-team')) : this.translateService.instant(getTypeStringChallenge(type)));
  }
  fillSurvey() {
    Browser.addListener('browserFinished', () => {
      //send refresh challenge event
      this.refresherService.onRefresh(null);
    });
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
        campaignContainer: this.campaignContainer,
        challenge: this.challenge,
        team: this.team
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
  challengeEnded() {
    if (!this.isGroupCompetitivePerformance()) {
      {
        if (
          this.challenge?.status === 100 ||
          this.challenge?.success === true ||
          this.challenge?.otherAttendeeData?.status === 100
        ) {
          return true;
        }
      }
    }
    return false;
  }
  challengeWon() {
    if (!this.isGroupCompetitivePerformance()) {
      if (this.challenge?.status === 100 || this.challenge.success === true) {
        return true;
      }
      else {
        return this.challenge.success;
      }
    }
  }
  private isGroupCompetitivePerformance() {
    return this.challenge.type === 'groupCompetitivePerformance';
  }

  challDesc(desc: string, name: string) {
    //sub id with name
    const search = this.challenge?.otherAttendeeData?.playerId;
    const searchRegExp = new RegExp(search, 'g');
    const replaceWith = name;
    if (this.team && name && desc)
      return desc.replace(searchRegExp, replaceWith);
    return desc
  }
}
