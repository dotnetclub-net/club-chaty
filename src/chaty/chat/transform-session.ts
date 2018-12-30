import { Message } from "wechaty";
import * as BotManager from "../bot/bot-manager"
import * as converter from "./converting/converter"
import RawChatHistoryMessage from "./messages/raw-history-message";
import { MessageType } from "wechaty-puppet";
import ConvertedMessage from "./converting/converted-message";

const notice = {
    started: '已收到你的消息 [Grin]',
    completed: '你的消息已在转换完成 [Smart]',
    notInChat: '你不是对话的参与者，请不要转发他人的对话 [Angry]'
}


interface ConvertState {
    defered: boolean,
    missingItems: any
}



export default class TransformSession {

    private _historyMessage : RawChatHistoryMessage;
    private  _converted : ConvertedMessage[];
    private _onCompleted : Function;
    private _createdTime : Date;

    constructor(historyMessage : Message, onCompleted : Function){
        this._historyMessage = new RawChatHistoryMessage(
            historyMessage.from().id, 
            historyMessage.to().id,
            historyMessage.text()); 

        this._onCompleted = onCompleted || (() => {});
        this._createdTime = new Date();
    }

    start() : void {
        this._converted = converter.convertToMessageList(this._historyMessage.text);
        const convertedState = this.getUpdatedState();
        if(!convertedState.defered){
            this.reply(notice.completed);
            // todo: completed
            this._onCompleted();
            return;
        }

        this.reply(notice.started);
        let msg = '不过，有一些内容需要单独再传过来：<br />';
        for(const key in convertedState.missingItems){
            const count = convertedState.missingItems[key];
            msg += `${count} 个 ${key} <br />`;
        }
        msg += '请按顺序提供这些内容，如果不想提供，请回复“直接转换”或“取消”。';
        this.reply(msg);
    }

    newMessageArrived(message : Message) : void {
        if(message.type() === MessageType.Text){
            switch (message.text()){
                case '直接转换':
                    // todo: ignore remaining missing items
                    return;
                case '取消':
                    this._onCompleted();
                    return;
                default:
                    const msg = '请按顺序提供内容，如果不想提供，请回复“直接转换”或“取消”。';
                    this.reply(msg);
                    return;
            }
        }

        let acceptedAs : string = '';
        
        const deferedMsgs = this._converted.filter(m => m.additionalMessageHanlder != null);
        deferedMsgs.forEach(msg => {
            if(!acceptedAs && msg.additionalMessageHanlder.accept(message)){
                acceptedAs = msg.additionalMessageHanlder.name;
                return false;
            }
        });

        if(!!acceptedAs){
            const currentState = this.getUpdatedState();
            if(currentState.defered){
                let msg = `收到 1 个 ${acceptedAs}，还缺少：`;
                for(const key in currentState.missingItems){
                    const count = currentState.missingItems[key];
                    msg += `${count} 个 ${key} <br />`;
                }
                msg += '请按顺序提供这些内容，如果不想提供，请回复“直接转换”或“取消”。';
                this.reply(msg);
            }
        }else{
            const msg = '请按顺序提供内容，如果不想提供，请回复“直接转换”或“取消”。';
            this.reply(msg);
        }
    }

    get createdAt() : Date {
        return this._createdTime;
    }

    get expired() : boolean {
        const sessionExpire = 600 * 1000; // 10 分钟
        
        const timeElapsed = new Date().getTime() - this.createdAt.getTime();
        return timeElapsed > sessionExpire;
    }

    private reply(text) : void {
       BotManager.sendMessageToContact(
           this._historyMessage.toId,
           this._historyMessage.fromId,
           text);
    }

    private getUpdatedState() : ConvertState{
        const deferedMsgs = this._converted.filter(m => m.additionalMessageHanlder != null);
        const stat : any = {};
        deferedMsgs.forEach((cur)=> {
            const handlerName = cur.additionalMessageHanlder.name;
            stat[handlerName] = (stat[handlerName] || 0) + 1;
        });

        return {
            defered: deferedMsgs.length > 0,
            missingItems: stat
        }
    }
}
  