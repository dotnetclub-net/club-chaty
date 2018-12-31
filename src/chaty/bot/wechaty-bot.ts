import { Contact, Message, Wechaty, FileBox } from 'wechaty'
import * as ChatManager from '../chat/chat-manager'
import config from '../../config'
import { PuppetModuleName } from 'wechaty/dist/src/puppet-config';
import { PuppetOptions } from 'wechaty-puppet';

const options = config();
const puppet : PuppetModuleName =  options['wechaty-puppet-name'];
const puppetOptions : PuppetOptions = options['wechaty-puppet-options'] || { };

export class ChatyBot{
    private _bot : Wechaty;
    private _startCB : Function;
    private _qrToScan : String;
    
    private _loggedInUser : Contact;
    private _loginTime : Date;
    private _status : ChatyBotStatus;

    constructor(startCB: Function){
        this._startCB = startCB;
        this._status = ChatyBotStatus.Unknown;

        this._start();
    }

    private _start() : void {
        if(this._status >= ChatyBotStatus.Starting){
            return;
        }

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
        
        this._status = ChatyBotStatus.Starting;
        bot.start()
        .then(() => {
            this._status = ChatyBotStatus.Started;
            console.log('Bot 已启动'); 
        })
        .catch(e => {
            this._status = ChatyBotStatus.StartError;
            console.error('启动 Bot 时发生错误')
            console.error(e);
        });

        function onScan (qrcode: string) {
            self._status = ChatyBotStatus.WaitingForScan;

            const qrcodeImageUrl = [
              'https://api.qrserver.com/v1/create-qr-code/?data=',
              encodeURIComponent(qrcode),
            ].join('');
            self._qrToScan = qrcodeImageUrl;
          
            console.log(`请扫描二维码以登录：${qrcode}`);
            process.nextTick(() => {self._startCB(qrcodeImageUrl);});
        }
          
        function onLogin (user: Contact) {
            self._status = ChatyBotStatus.LoggedIn;

            self._qrToScan = null;
            self._loginTime = new Date();
            self._loggedInUser = user;

            console.log(`${user} 已登录`);
            if(!self._qrToScan){
                process.nextTick(self._startCB);
            }
        }
          
        function onLogout (user: Contact) {
            this._status = ChatyBotStatus.Started;

            self._qrToScan = null;
            self._loginTime = null;
            self._loggedInUser = null;

            console.log(`${user} 已退出登录`);
        }
        
        async function onMessage (msg: Message) {
            if(shouldSkipMessage(msg)){
                return;
            }
            
            console.log(`收到新消息：${msg.toString()}`);
            const payload = await self._bot.puppet["messageRawPayload"](msg.id);
            console.log(JSON.stringify(payload));
            ChatManager.handleMessage(msg);
        }

        function shouldSkipMessage(msg : Message){
            const ignoreIds = ['weixin', 'WeChat'];
            const sourceId = msg.from() ? msg.from().id : '';
            const destId = msg.to() ? msg.to().id : ''; 

            if (!sourceId || !destId) {
                return true;
            }
           
            if (msg.type() === Message.Type.Unknown) {
                return true;
            }

            if (msg.room()) {
                return true;
            }

            if(sourceId.substr(0, 3) === 'gh_'){
                return true;
            }

            if(ignoreIds.indexOf(sourceId) > -1){
                return true;
            }

            if(msg.self() && destId !== sourceId){
                return true;
            }

            return false;
        }
    }

    stop(callback : Function) {
        if(!this._bot){
            return;
        }

        this._qrToScan = null;
        this._bot.logout().then(() => {
            this._status = ChatyBotStatus.Stopping;
            this._bot.stop().then(() => {
                this._status = ChatyBotStatus.Stopped;
                this._bot = null;

                process.nextTick(callback);
            }).catch(ex => {
                this._status = ChatyBotStatus.StopError;
            });
        });
    }

    getStatus(): ChatyBotState {
        return {
            status: this._status,
            account_id: this._loggedInUser ? this._loggedInUser.id : null,
            login_time: this._loggedInUser ? this._loginTime : null
        };
    }

    get loginQRCode(): String {
        return this._qrToScan; 
    }

    supportsDownloadAttachmentLocally(){
        return  !!(this._bot && this._bot.puppet["cdnManager"]);
    }
    
    async downloadAttachment(cdnattachurl, aeskey, totallen): Promise<FileBox> {
        const cdnManager : any = this._bot.puppet["cdnManager"];
        const data = await cdnManager.downloadFile(
            cdnattachurl || '',
            aeskey || '',
            totallen || 0,
          );
          
        const date = new Date().getTime();
        return FileBox.fromBase64(data.toString('base64'), `${date}.file`);
    }
    
    async sendMessage(toId : string, text: string): Promise<void> {
        console.log(`正在回复 ${toId}：${text}`);

        if(toId === this._loggedInUser.id){
            return;
        }

        const contact = this._bot.Contact.load(toId)
        await contact.say(text);
    }
}

export interface ChatyBotState {
    status: ChatyBotStatus;
    account_id: String;
    login_time: Date;
}

export enum ChatyBotStatus {
    Unknown = 0,

    Starting = 1,
    Started = 2,
    
    WaitingForScan = 3,
    LoggedIn = 4,

    Stopping = 9,
    Stopped = 10,

    StartError = 77,
    StopError = 99
}
