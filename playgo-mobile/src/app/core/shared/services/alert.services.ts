import { Injectable } from "@angular/core";
import { ToastController, LoadingController, AlertController } from "@ionic/angular";
@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private toast;
    private loading;
    constructor(
        private toastController: ToastController,
        private loadingController: LoadingController,
        private alertController: AlertController) {

    }
    public async showToast(message:string){
        this.toast=await this.toastController.create({
            message,
            duration:3000,
            position:'bottom'
        });
        this.toast.present();
    }

    public async confirmAlert(header, message, buttons, cssClass?):Promise<boolean>{
        return new Promise(async (resolve,reject) => {
            const alert = await this.alertController.create({
                cssClass: cssClass,
                header: header,
                message: message,
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    id: 'cancel-button',
                    handler: () => {
                        resolve(false);
                    }
                  }, {
                    text: 'Okay',
                    id: 'confirm-button',
                    handler: () => {
                      resolve(true);
                    }
                  }
                ]
              });
          
              await alert.present();
        })  
    }
    public async showLoading(message?){
        this.loading = await this.loadingController.create({
            message:message,
            duration:3000
        })

        await this.loading.present();
    }
    public async dismissLoading(){

    }

}