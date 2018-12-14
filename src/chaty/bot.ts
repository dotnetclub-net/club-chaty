import { Contact, Message, Wechaty } from 'wechaty'

/**
 * Config wechaty, see: https://github.com/chatie/wechaty
 */
const WECHATY_PUPPET_PADCHAT_TOKEN = 'puppet_padchat_579a8b3a5707e433'
const puppet = 'wechaty-puppet-padchat'
const puppetOptions = {
  token: WECHATY_PUPPET_PADCHAT_TOKEN,
}

class ChatyBot{
    private _bot : Wechaty;
    private _scanCB : Function;
    private _loggedInUser : Contact;
    private _loginTime : Date;

    constructor(scanCB){
        this._scanCB = scanCB;
        this._start();
    }

    private _start() : void {
        const bot = new Wechaty({
            name: 'dotnetclub-chaty',
            puppet,
            puppetOptions,
        });

        this._bot = bot;
        const self = this;

        bot.on('scan', onScan)
        bot.on('login', onLogin);
        bot.on('logout',  onLogout);
        bot.on('message', onMessage);
        
        bot.start()
        .then(() => console.log('Bot 已启动.'))
        .catch(e => {
            console.error('Bot 发生了错误')
            console.error(e)
        });


        function onScan (qrcode: string) {
            const qrcodeImageUrl = [
              'https://api.qrserver.com/v1/create-qr-code/?data=',
              encodeURIComponent(qrcode),
            ].join('')
          
            self._scanCB(qrcodeImageUrl);
          }
          
        function onLogin (user: Contact) {
            self._loginTime = new Date();
            self._loggedInUser = user;
            console.log(`${user} 已登录`);
          }
          
        function onLogout (user: Contact) {
            self._loginTime = null;
            self._loggedInUser = null;
            console.log(`${user} logout`)
          }
          
          
        async function onMessage (msg: Message) {
        const text = msg.text()
        const type = msg.type()
        const room = msg.room()
        
        if (msg.self()) {
            return
        }
        
        if (room) {
            return
        }
        
        if (type !== Message.Type.Text) {
            return
        }
        }
    }

    stop(): void {
        if(this._bot == null){
            return;
        }

        this._bot.logout();
        this._bot.stop();
        this._bot = null;
    }

    getStatus(): ChatyBotStatus {
        return {
            logged_in: this._loggedInUser != null,
            account_id: this._loggedInUser.id,
            login_time: this._loginTime
        };
    }
}

interface ChatyBotStatus {
    logged_in: boolean;
    account_id: String;
    login_time: Date;
}

let botInstance : ChatyBot = null;

export let getStatus = function() : ChatyBotStatus{
    if(botInstance == null){
        return {
            logged_in: false,
            account_id: null,
            login_time: null
        };
    }

    return botInstance.getStatus()
};

export let start = function(scanCb){
    if(botInstance != null){
        return;
    }

    botInstance = new ChatyBot(scanCb);
};

export let stop = function(){
    if(botInstance != null){
        botInstance.stop();
    }
    botInstance = null;
};