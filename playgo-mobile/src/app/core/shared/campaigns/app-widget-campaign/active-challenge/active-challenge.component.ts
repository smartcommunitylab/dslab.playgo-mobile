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
import { NavController } from '@ionic/angular';
import { TeamService } from '../../../services/team.service';
import { Observable } from 'rxjs';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-active-challenge',
  templateUrl: './active-challenge.component.html',
  styleUrls: ['./active-challenge.component.scss'],
})
export class ActiveChallengeComponent implements OnInit, AfterViewInit {
  @Input() challenge: Challenge;
  @Input() campaign: PlayerCampaign;
  @Input() team?: boolean = false;
  public anchors: any;
  otherTeam$: Observable<PlayerTeam>;

  imgChallenge = getImgChallenge;
  type = 'active';
  constructor(private elementRef: ElementRef, private navController: NavController, private teamService: TeamService, private errorService: ErrorService) { }
  ngAfterViewInit() {
    //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    this.anchors.forEach((anchor: HTMLAnchorElement) => {
      anchor.addEventListener('click', this.handleAnchorClick);
    });
  }
  ngOnInit() {
    if (this.team && this.challenge?.otherAttendeeData) {
      try {
        this.otherTeam$ = this.teamService.getPublicTeam(
          this.campaign?.campaign?.campaignId,
          this.challenge?.otherAttendeeData.playerId
        )
      } catch (error) {
        this.errorService.handleError(error, 'silent');
      }
    };
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
  goToChallenge(event: Event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.navController.navigateRoot('/pages/tabs/challenges');
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
