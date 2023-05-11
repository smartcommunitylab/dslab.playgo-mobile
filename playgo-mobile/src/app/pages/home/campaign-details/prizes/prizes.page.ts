/* eslint-disable prefer-const */
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DateTime, Interval } from 'luxon';
import { Observable, map, shareReplay, Subscription, firstValueFrom } from 'rxjs';
import { CampaignWeekConf } from 'src/app/core/api/generated/model/campaignWeekConf';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { PrizeModalPage } from './prize-modal/prize.modal';
import { Browser } from '@capacitor/browser';
import { DetailPrizeModalPage } from './detail-modal/detail.modal';
import { TranslateService } from '@ngx-translate/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './prizes.page.html',
  styleUrls: ['./prizes.page.scss'],
})
export class PrizesPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  notExpanded = true;
  public anchors: any;
  selectedSegment?: string;
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  subId: Subscription;
  subStatus: Subscription;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  id: string;
  dateTimeToCheck = DateTime.utc();
  constructor(
    private route: ActivatedRoute,
    private pageSettingsService: PageSettingsService,
    private campaignService: CampaignService,
    private modalController: ModalController,
    private translateService: TranslateService
  ) {
    this.subId = this.route.params.subscribe((params) => {
      this.id = params.id;
      this.subCampaign = this.campaignService.myCampaigns$.subscribe(
        (campaigns) => {
          this.campaignContainer = campaigns.find(
            (campaignContainer) =>
              campaignContainer.campaign.campaignId === this.id
          );
          this.campaignContainer.campaign.weekConfs.sort((a, b) => b.dateFrom - a.dateFrom);
        }
      );
    });
  }
  ngOnInit() {

  }
  ionViewWillEnter() {
    this.changePageSettings();
    this.selectedSegment = 'periodicPrizes';
  }
  getFinalPrize() {
    let prize = this.campaignContainer.campaign.weekConfs.find(x => x.weekNumber === 0);
    if (prize.rewards?.length > 0) { return prize; }
    return null;
  }
  getActualPrize() {
    let prize = this.campaignContainer.campaign?.weekConfs?.find(x => this.isThisPeriod(x.dateFrom, x.dateTo));
    if (prize.rewards?.length > 0) { return prize; }
    return null;
  }
  async openWeekDescActual(finalPrize: CampaignWeekConf) {
    const titlePrize = await firstValueFrom(
      this.translateService.get('campaigns.detail.prize.actualWeekTitle')
    );
    const modal = await this.modalController.create({
      component: DetailPrizeModalPage,
      componentProps: {
        title: titlePrize,
        detail: finalPrize.desc,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
  scrollTo(elementId: string) {
    let id = document.getElementById('subprizes');
    this.content.scrollToPoint(0, id.offsetTop, 1000);

  }
  pastprizes() {
    //get all the confs and check if there are confs before dateTimetocheck
    // eslint-disable-next-line arrow-body-style
    return this.campaignContainer.campaign?.weekConfs?.find(x => {
      return DateTime.fromMillis(x.dateTo) < this.dateTimeToCheck && x.rewards?.length > 0;
    }
    );
  }
  async openWeekDescPast(confPrize: CampaignWeekConf) {
    const titlePrize = await firstValueFrom(
      this.translateService.get('campaigns.detail.prize.actualWeekTitle')
    );
    const modal = await this.modalController.create({
      component: DetailPrizeModalPage,
      componentProps: {
        title: titlePrize,
        detail: confPrize.desc,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
  async openRewardDescActual(actualPrize: CampaignWeekConf, index: number) {
    const titlePrize = await firstValueFrom(
      this.translateService.get('campaigns.detail.prize.periodicWeekTitle')
    );
    const modal = await this.modalController.create({
      component: DetailPrizeModalPage,
      componentProps: {
        title: titlePrize,
        detail: actualPrize?.rewards[index].rewardNote,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
  async openWeekDescFinal(actualPrize: CampaignWeekConf) {
    const titlePrize = await firstValueFrom(
      this.translateService.get('campaigns.detail.prize.finalWeekTitle')
    );
    const modal = await this.modalController.create({
      component: DetailPrizeModalPage,
      componentProps: {
        title: titlePrize,
        detail: actualPrize.desc,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

  }
  async openRewardDescFinal(finalPrize: CampaignWeekConf, index: number) {
    const titlePrize = await firstValueFrom(
      this.translateService.get('campaigns.detail.prize.finalRewardTitle')
    );
    const modal = await this.modalController.create({
      component: DetailPrizeModalPage,
      componentProps: {
        title: titlePrize,
        detail: finalPrize?.rewards[index].rewardNote,
      },
      cssClass: 'challenge-info',
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
  }
  ngAfterViewInit() {
    // //change the behaviour of _blank arrived with editor, adding a new listener and opening a browser
    // this.anchors = this.elementRef.nativeElement.querySelectorAll('a');
    // this.anchors.forEach((anchor: HTMLAnchorElement) => {
    //   anchor.addEventListener('click', this.handleAnchorClick);
    // });
  }
  expandPrizes() {
    this.notExpanded = false;
    this.scrollTo('subprizes');
  }
  openLink(link: string) {
    Browser.open({
      url: link,
      windowName: '_system',
      presentationStyle: 'popover',
    });
  }
  getPostion(arg0: number) {
    switch (arg0) {
      case 0:
        return 'gold';
      case 1:
        return 'silver';
      case 2:
        return 'bronze';
      default:
        return '';
    }
  }
  isThisPeriod(dateFrom: number, dateTo: number): boolean {
    const interval = Interval.fromDateTimes(DateTime.fromMillis(dateFrom), DateTime.fromMillis(dateTo));
    return interval.contains(this.dateTimeToCheck);
  }
  private changePageSettings() {
    this.pageSettingsService.set({
      color: this.campaignContainer?.campaign?.type,
    });
  }
  ngOnDestroy(): void {
    this.subCampaign.unsubscribe();
    this.subId.unsubscribe();
  }
  async openPrize() {
    const modal = await this.modalController.create({
      component: PrizeModalPage,
      cssClass: 'challenge-info',

    });
    await modal.present();
    await modal.onWillDismiss();
  }

  isBeforeNow(conf: CampaignWeekConf): any {
    return DateTime.fromMillis(conf?.dateTo) < this.dateTimeToCheck;
  }
}

