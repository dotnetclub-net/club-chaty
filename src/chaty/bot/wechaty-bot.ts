import { Contact, Message, Wechaty, FileBox, Friendship } from 'wechaty'
import * as ChatManager from '../chat/chat-manager'
import * as PairManager from './pair-manager'
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
        bot.on('friendship', onFriendship);
        
        this._status = ChatyBotStatus.Starting;
        bot.start()
        .then(() => {
            if(this._status < ChatyBotStatus.Started){
                this._status = ChatyBotStatus.Started;
            }
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
            process.nextTick(self._startCB);
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

        async function onFriendship(friendship : Friendship) {
            try {
              if(friendship.type() === Friendship.Type.Receive) {
                // 还可以用 friendship.hello() 验证
                await friendship.accept();
                console.log(`添加了新的好友 ${friendship.contact().name()}`);
                
                PairManager.welcomeAndSendCode(self._loggedInUser.id, friendship.contact());
              }          
            } catch (e) {
              console.error(e)
            }
          }
    }

    stop(callback : Function) {
        if(!this._bot){
            return;
        }

        this._qrToScan = null;
        this._status = ChatyBotStatus.Stopping;
        
        this._bot.logout().then(() => {
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
            login_time: this._loggedInUser ? this._loginTime : null,
            login_qrcode: this._loggedInUser ? null : this._qrToScan
        };
    }

    async getInfo() : Promise<ChatyBotInfo> {
        if(!this._loggedInUser){
            return {
                qrCode: null,
                name: null,
                weixin: null,
                chatyId: null,
            };
        }

        const qrcode : string = await this._bot.puppet.contactSelfQrcode();

        return {
            qrCode: qrcode,
            name: this._loggedInUser.name(),
            weixin: this._loggedInUser.weixin(),
            chatyId: this._loggedInUser.id
        }
    }

    get loginQRCode(): String {
        return this._qrToScan; 
    }

    supportsDownloadingDirectly(){
        return  !!(this._bot && this._bot.puppet["cdnManager"]);
    }
    
    async downloadFile(fileId: string, aeskey: string, totallen: number, fileType: CDNFileType): Promise<FileBox> {
        if(!this._loggedInUser){
            console.warn(`已退出登录，无法下载文件 ${fileId}`);
            return Promise.reject("已退出登录，无法下载");
        }

        const cdnManager : any = this._bot.puppet["cdnManager"];
        const data = await cdnManager.downloadFile(
            fileId || '',
            aeskey || '',
            totallen || 0,
            fileType
          );
          
        const date = new Date().getTime();
        return FileBox.fromBase64(data.toString('base64'), `${date}.file`);
    }
    
    async sendMessage(toId : string, text: string): Promise<void> {
        if(!this._loggedInUser){
            console.warn(`已退出登录，无法回复 ${toId}：${text}`);
            return;
        }

        console.log(`正在回复 ${toId}：${text}`);

        if(toId === this._loggedInUser.id){
            return;
        }

        const contact = this.loadContact(toId);
        if(contact == null || !contact.friend()){
            return;
        }

        await contact.say(text);
    }

    loadContact(id: string): Contact{
        if(!this._loggedInUser){
            console.warn(`已退出登录，无法加载联系人 ${id}`);
            return null;
        }

        return this._bot.Contact.load(id);
    }
}

export interface ChatyBotState {
    status: ChatyBotStatus;
    login_qrcode: String;
    account_id: String;
    login_time: Date;
}

export interface ChatyBotInfo {
    name: String;
    qrCode: String;
    weixin: String;
    chatyId: String;
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


export enum CDNFileType {
    IMAGE = 1,
    VIDEO_THUMBNAIL = 3,
    VIDEO = 4,
    ATTACHMENT = 5,
}
