import { Injectable, Injector } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { PlayerCampaign } from 'src/app/core/api/generated/model/playerCampaign';
import { CampaignAcceptanceModalComponent } from '../campaign-acceptance-modal/campaign-acceptance.modal';
import { CampaignService } from './campaign.service';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class CampaignAcceptanceService {
  private isProcessingQueue = false;

  constructor(
    private modalCtrl: ModalController,
    private injector: Injector,
    private errorService: ErrorService
  ) {}

  private get campaignService(): CampaignService {
    return this.injector.get(CampaignService);
  }

  public async checkCampaignsAcceptance(myCampaigns: PlayerCampaign[]): Promise<void> {
    if (!myCampaigns || myCampaigns.length === 0 || this.isProcessingQueue) {
      return;
    }

    // Filtra tutte le campagne che hanno almeno uno dei due flag a false
    const pendingList = myCampaigns.filter((pc) => {
      const sub: any = pc.subscription || pc;
      const rulesFalse = sub?.rulesAcceptance === false;
      const privacyFalse = sub?.privacyAcceptance === false;
      return rulesFalse || privacyFalse;
    });

    if (pendingList.length === 0) return;

    this.isProcessingQueue = true;

    try {
      // Esegue la coda in sequenza per gestire N campagne pendenti
      for (const playerCampaign of pendingList) {
        const sub: any = playerCampaign.subscription || playerCampaign;
        const needsRules = sub?.rulesAcceptance === false;
        const needsPrivacy = sub?.privacyAcceptance === false;

        const modal = await this.modalCtrl.create({
          component: CampaignAcceptanceModalComponent,
          componentProps: {
            playerCampaign,
            needsPrivacy,
            needsRules,
          },
          backdropDismiss: false,
        });

        await modal.present();
        const { data } = await modal.onDidDismiss();

        if (data?.action === 'accept') {
          await firstValueFrom(
            this.campaignService.updateAcceptance(
              playerCampaign.campaign.campaignId,
              data.privacyAcceptance,
              data.rulesAcceptance
            )
          );
        } else if (data?.action === 'unsubscribe') {
          await firstValueFrom(
            this.campaignService.unsubscribeCampaign(playerCampaign.campaign.campaignId)
          );
        }
      }
    } catch (e) {
      this.errorService.handleError(e, 'normal');
    } finally {
      this.isProcessingQueue = false;
    }
  }
}