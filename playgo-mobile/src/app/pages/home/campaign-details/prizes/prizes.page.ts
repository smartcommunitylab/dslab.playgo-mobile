/* eslint-disable prefer-const */
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DateTime, Interval } from 'luxon';
import { Observable, map, shareReplay, Subscription } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignService } from 'src/app/core/shared/services/campaign.service';
import { PageSettingsService } from 'src/app/core/shared/services/page-settings.service';
import { PrizeModalPage } from './prize-modal/prize.modal';

@Component({
  selector: 'app-stats',
  templateUrl: './prizes.page.html',
  styleUrls: ['./prizes.page.scss'],
})
export class PrizesPage implements OnInit, OnDestroy {
  campaignId$: Observable<string> = this.route.params.pipe(
    map((params) => params.id),
    shareReplay(1)
  );
  subId: Subscription;
  subStatus: Subscription;
  subCampaign: Subscription;
  campaignContainer: PlayerCampaign;
  id: string;
  constructor(
    private route: ActivatedRoute,
    private pageSettingsService: PageSettingsService,
    private campaignService: CampaignService,
    private modalController: ModalController
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
  }
  getPostion(arg0: number) {
    switch (arg0) {
      case 1:
        return 'gold';
      case 2:
        return 'silver';
      default:
        return 'bronze';
    }
  }
  isThisPeriod(dateFrom: number, dateTo: number): boolean {
    const interval = Interval.fromDateTimes(DateTime.fromMillis(dateFrom), DateTime.fromMillis(dateTo));
    let dateTimeToCheck = DateTime.utc();
    return interval.contains(dateTimeToCheck);
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
      cssClass: 'modalConfirm',

    });
    await modal.present();
    await modal.onWillDismiss();
  }

}

