import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Challenge } from '../../challenges.page';
import { Browser } from '@capacitor/browser';
import { TeamService } from 'src/app/core/shared/services/team.service';
import { PlayerTeam } from 'src/app/core/api/generated-hsc/model/playerTeam';
import { Observable } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';

@Component({
  selector: 'app-detail-modal',
  templateUrl: './detail.modal.html',
  styleUrls: ['./detail.modal.scss'],
})
export class DetailChallengenModalPage implements OnInit, AfterViewInit {
  campaignContainer: PlayerCampaign;
  challenge: Challenge;
  team: boolean;
  public anchors: any;
  otherTeam$: Observable<PlayerTeam>;

  constructor(
    private elementRef: ElementRef,
    private modalController: ModalController,
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
  close() {
    this.modalController.dismiss(false);
  }
  challDesc(desc: string, name: string) {
    //sub id with name
    if (this.team && name)
      return desc.replace(this.challenge?.otherAttendeeData.playerId, name);
    return desc
  }
}
