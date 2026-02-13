import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StoreUpdateService } from './store-update.service';
import { AutoUpdateService } from './auto-update.service';
import { UpdateReminderService } from './update-reminder.service';
import { filter, take, firstValueFrom } from 'rxjs';
import { StoreUpdateModalComponent } from '../update/update-modal/store-update-modal.component';

@Injectable({ providedIn: 'root' })
export class UpdateCoordinatorService {
  
  private hasShownStoreModal = false;

  constructor(
    private storeUpdateService: StoreUpdateService,
    private autoUpdateService: AutoUpdateService,
    private updateReminderService: UpdateReminderService,
    private modalController: ModalController
  ) {}

  async checkAllUpdates(): Promise<void> {
    console.log('🔍 UpdateCoordinator: Starting update check...');
    
    console.log('📱 UpdateCoordinator: Checking store update...');
    await this.storeUpdateService.checkStoreUpdate();
    
    console.log('⏳ UpdateCoordinator: Waiting for store check result...');
    const storeInfo = await firstValueFrom(
      this.storeUpdateService.storeUpdate$.pipe(
        filter(info => {
          console.log('📊 UpdateCoordinator: Store info received:', info);
          return !info.isChecking;
        }),
        take(1)
      )
    );

    console.log('✅ UpdateCoordinator: Store check completed:', storeInfo);

    if (storeInfo?.isUpdateAvailable) {
      // Controlla se bisogna mostrare il modale
      const shouldShow = await this.updateReminderService.shouldShowUpdateModal(
        storeInfo.storeVersion!
      );
      
      if (shouldShow) {
        console.log('🎉 UpdateCoordinator: Store update available! Showing modal...');
        await this.showStoreUpdateModal(storeInfo);
      } else {
        console.log('⏰ UpdateCoordinator: Update reminder active, skipping modal');
        // Procedi comunque con hot code update
        await this.autoUpdateService.checkForUpdate(false);
      }
    } else {
      console.log('⚠️ UpdateCoordinator: No store update. Checking hot code update...');
      await this.autoUpdateService.checkForUpdate(false);
    }
    
    console.log('🏁 UpdateCoordinator: Update check completed');
  }

  private async showStoreUpdateModal(storeInfo: any): Promise<void> {
    if (this.hasShownStoreModal) {
      console.log('⚠️ UpdateCoordinator: Modal already shown, skipping');
      return;
    }
    this.hasShownStoreModal = true;

    console.log('🔍 UpdateCoordinator: Getting hot code info...');
    const hotCodeInfo = await firstValueFrom(
      this.autoUpdateService.hotCodeUpdate$.pipe(take(1))
    );

    const isMandatory = hotCodeInfo?.isNativeVersionTooOld || false;
    
    console.log('📋 UpdateCoordinator: Modal config:', {
      currentVersion: storeInfo.currentVersion,
      storeVersion: storeInfo.storeVersion,
      isMandatory
    });

    const modal = await this.modalController.create({
      component: StoreUpdateModalComponent,
      componentProps: {
        currentVersion: storeInfo.currentVersion,
        storeVersion: storeInfo.storeVersion,
        isMandatory: isMandatory
      },
      backdropDismiss: !isMandatory,
      cssClass: 'store-update-modal'
    });

    console.log('🚀 UpdateCoordinator: Presenting modal...');
    await modal.present();

    const { data } = await modal.onWillDismiss();
    console.log('📤 UpdateCoordinator: Modal dismissed with data:', data);

    if (data?.action === 'update') {
      console.log('📲 UpdateCoordinator: Opening store...');
      await this.storeUpdateService.openStore();
      // Rimuovi reminder se l'utente aggiorna
      await this.updateReminderService.clearReminder();
    } else if (data?.action === 'remind') {
      console.log('⏰ UpdateCoordinator: Setting reminder for 1 week');
      await this.updateReminderService.setReminder(storeInfo.storeVersion!);
      // Procedi con hot code update
      await this.autoUpdateService.checkForUpdate(false);
    } else if (data?.action === 'skip') {
      console.log('⏭️ UpdateCoordinator: User skipped update');
      // Procedi con hot code update
      await this.autoUpdateService.checkForUpdate(false);
    }
  }
}