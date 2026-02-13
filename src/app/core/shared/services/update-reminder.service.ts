import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class UpdateReminderService {
  
  private readonly REMINDER_KEY = 'update_reminder';
  private readonly ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 giorni

  async shouldShowUpdateModal(storeVersion: string): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.REMINDER_KEY });
      
      if (!value) {
        return true; // Nessun reminder salvato, mostra
      }

      const reminder = JSON.parse(value);
      
      if (reminder.version !== storeVersion) {
        return true;
      }

      // Controlla se è passata una settimana
      const now = Date.now();
      const weekPassed = (now - reminder.timestamp) > this.ONE_WEEK_MS;
      
      if (weekPassed) {
        // Rimuovi il reminder scaduto
        await this.clearReminder();
        return true;
      }

      console.log(`⏰ Update reminder attivo fino a: ${new Date(reminder.timestamp + this.ONE_WEEK_MS)}`);
      return false;
      
    } catch (error) {
      console.error('Error checking update reminder:', error);
      return true; // In caso di errore, mostra
    }
  }

  async setReminder(storeVersion: string): Promise<void> {
    try {
      const reminder = {
        version: storeVersion,
        timestamp: Date.now()
      };
      
      await Preferences.set({
        key: this.REMINDER_KEY,
        value: JSON.stringify(reminder)
      });
      
      console.log(`✅ Update reminder salvato per v${storeVersion}`);
    } catch (error) {
      console.error('Error setting update reminder:', error);
    }
  }

  async clearReminder(): Promise<void> {
    try {
      await Preferences.remove({ key: this.REMINDER_KEY });
      console.log('🗑️ Update reminder rimosso');
    } catch (error) {
      console.error('Error clearing update reminder:', error);
    }
  }

  async getReminderInfo(): Promise<{ version: string; expiresAt: Date } | null> {
    try {
      const { value } = await Preferences.get({ key: this.REMINDER_KEY });
      
      if (!value) {
        return null;
      }

      const reminder = JSON.parse(value);
      return {
        version: reminder.version,
        expiresAt: new Date(reminder.timestamp + this.ONE_WEEK_MS)
      };
    } catch (error) {
      return null;
    }
  }
}