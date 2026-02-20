import { Pipe, PipeTransform } from '@angular/core';
import { Campaign } from '../../api/generated/model/campaign';
import { PlayerCampaign } from '../../api/generated/model/playerCampaign';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'campaignPointName',
  standalone: false
})
export class CampaignPointNamePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  /**
   * Ritorna il nome dei punti personalizzato dalla campagna
   * oppure fallback alla traduzione standard
   * 
   * @param campaign - Campaign o PlayerCampaign
   * @param fallbackKey - Chiave di traduzione di fallback (es: 'campaigns.score_label.flower')
   * @returns Nome localizzato dei punti
   */
  transform(
    campaign: Campaign | PlayerCampaign | null, 
    fallbackKey: string = 'campaigns.leaderboard.leaderboard_type_unit.GL'
  ): string {
    if (!campaign) {
      return this.translate.instant(fallbackKey);
    }

    const campaignData = (campaign as PlayerCampaign).campaign || campaign as Campaign;
    const pointName = campaignData?.specificData?.pointName;
    
    if (pointName) {
      const currentLang = this.translate.currentLang || 'it';
      return pointName[currentLang] || pointName['it'] || this.translate.instant(fallbackKey);
    }
    return this.translate.instant(fallbackKey);
  }
}