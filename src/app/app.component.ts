import { Component, NgZone } from '@angular/core';
import Web3 from 'web3';
import Web3EthContract from 'web3-eth-contract';
const { ethereum } = (window as any);



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web3-util';
  web3: any;
  hasWallet: boolean = false;
  walletConnected: boolean = false;
  networkId: any;
  accounts: any;
  watchAddresses: Array<string> = [];
  watchAddress: string = '';
  watchLog: Array<any> = [];
  watchSubscriptions: any = {};
  notifyMe: boolean = false;

  constructor(private _ngZone: NgZone) 
  {
    this.web3Init();
    this.loadState();
  }

  loadState()
  {
    const watchAddresses = JSON.parse(localStorage.getItem('watchAddresses') as any);
    if(watchAddresses != null && watchAddresses.length > 0){
      watchAddresses.forEach((address: string) => {
        this.subscribeToAddress(address);
        this.watchAddresses.push(address);
      });
      
    }
  }

  web3Init()
  {
    this.hasWallet = ethereum && ethereum.isMetaMask;
    this.web3 = new Web3(ethereum);
    this.checkWalletConnected();
  }

  checkWalletConnected()
  {
    this.web3.eth.getAccounts()
      .then((res: any) => {
        console.log(res);
        if(res.length > 0){
          this.walletConnected = true;
        }
      })
      .catch((err: any) => {console.log(err)})
  }

  onClickConnect()
  {
    this.connect();
  }

  async connect()
  {
    if(this.hasWallet){
      this.accounts = await ethereum.request({method: 'eth_requestAccounts'});
      this.networkId = await ethereum.request({
        method: "net_version",
      });
      this.walletConnected = true;

      ethereum.on("accountsChanged", (accounts: any) => {
        console.log('accounts changed');
        this.accounts = accounts[0];
      });

      ethereum.on("chainChanged", () => {
        console.log('chain changed');
        //window.location.reload();
      });

      
    }
  }

  onWatchClick(){
    //test address: 0x9f28455a82baa6b4923a5e2d7624aaf574182585
    /* SHIB WHALE
    0x1406899696adb2fa7a95ea68e80d4f9c82fcdedd
    0xc1cae0a347db30cf2cbbd80127fe2182804f8a9e
    0x31987132665ae1cbbb64b73f728cc81340486cef
    0x99c1406452470cfce0fadd355c41077593680e76
    0xf28d22c8b25ff8fa961e305bba701918ddc3339a
    */
    this.subscribeToAddress(this.watchAddress);
    this.watchAddresses.push(this.watchAddress);
    localStorage.setItem('watchAddresses', JSON.stringify(this.watchAddresses));
    this.watchAddress = '';
  }

  onWatchAddressClick(address:string)
  {
    this.watchAddresses = this.watchAddresses.filter((arAddress: any) => arAddress != address);
    localStorage.setItem('watchAddresses', JSON.stringify(this.watchAddresses));
    this.watchSubscriptions[address].unsubscribe();
  }

  subscribeToAddress(watchAddress: string)
  {
    this.watchSubscriptions[watchAddress] = this.web3.eth.subscribe('logs', {
      address: watchAddress,
    }, (error: any, result: any) => {
      if (!error){
        console.log(result);
        this.watchLog.unshift(result);
        this._ngZone.run(()=>{});
        if(this.notifyMe){
          this.notify("Watch Wallet Activity Detected.");
        }
      }
    });
  }

  onClearLogClick()
  {
    this.clearLog();
  }

  clearLog()
  {
    this.watchLog = [];
  }


  notify(notificationMsg: string) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(notificationMsg);
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification(notificationMsg);
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

  onClickNotifyMe(ev: any)
  {
    console.log(ev);
    if(this.notifyMe){
      Notification.requestPermission();
    }
  }
}
