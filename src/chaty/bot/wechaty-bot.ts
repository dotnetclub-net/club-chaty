import { Contact, Message, Wechaty } from 'wechaty'
import * as ChatManager from '../chat/chat-manager'

/**
 * Config wechaty, see: https://github.com/chatie/wechaty
 */
const puppet = 'wechaty-puppet-puppeteer'
const puppetOptions = {
//   token: WECHATY_PUPPET_PADCHAT_TOKEN,
}

export class ChatyBot{
    private _bot : Wechaty;
    private _startCB : Function;
    private _requireScanning : boolean;
    private _loggedInUser : Contact;
    private _loginTime : Date;

    constructor(startCB: Function){
        this._startCB = startCB;
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
        .then(() => console.log('Bot 已启动'))
        .catch(e => {
            console.error('启动 Bot 时发生错误')
            console.error(e)
        });


        function onScan (qrcode: string) {
            self._requireScanning = true;

            const qrcodeImageUrl = [
              'https://api.qrserver.com/v1/create-qr-code/?data=',
              encodeURIComponent(qrcode),
            ].join('')
          
            process.nextTick(() => {self._startCB(qrcodeImageUrl);});
        }
          
        function onLogin (user: Contact) {
            self._loginTime = new Date();
            self._loggedInUser = user;

            console.log(`${user} 已登录`);
            if(!self._requireScanning){
                process.nextTick(self._startCB);
            }
          }
          
        function onLogout (user: Contact) {
            self._loginTime = null;
            self._loggedInUser = null;
            console.log(`${user} 已退出登录`);
          }
          
          
        function onMessage (msg: Message) {
            if (msg.self()) {
                return;
            }
            
            if (msg.room()) {
                return;
            }
            
            // if (msg.type() !== Message.Type.ChatHistory) {
            //     msg.say('仅能处理“聊天记录”类型的消息。');
            //     return;
            // }

            console.log(msg.toString());
            ChatManager.enqueue(msg.from().id, msg.text(), function(reply: string){
                console.log(`正在发送回复 '${reply}'`);
                msg.say(reply);
            });
        }
    }

    stop(callback : Function) {
        if(this._bot == null){
            return;
        }

        this._bot.logout().then(() => {
            this._bot.stop().then(() => {
                this._bot = null;
                process.nextTick(callback);
            });
        });
    }

    getStatus(): ChatyBotStatus {
        return {
            logged_in: this._loggedInUser != null,
            account_id: this._loggedInUser.id,
            login_time: this._loginTime
        };
    }
}

export interface ChatyBotStatus {
    logged_in: boolean;
    account_id: String;
    login_time: Date;
}