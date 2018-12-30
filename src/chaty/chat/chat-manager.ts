import { MessageType } from 'wechaty-puppet';
import { Message } from 'wechaty';
import TransformSession from './transform-session';
import * as BotManager from "../bot/bot-manager"

const notice = {
    notHistory: '请转发消息记录类型的消息',
    error: '暂时不能处理消息，请稍后再试 [Awkward]'
};

const sessions = {};

function clearSession(sourceId: string){
    return () => {
        sessions[sourceId] = null;
    };
}

export let enqueue = function(message: Message): void {
    try{
        const isHistoryMsg : boolean  = message.type() === MessageType.ChatHistory
        const sourceId : string = message.from().id;
        let session : TransformSession = sessions[sourceId];
        const hasValidSession = !!session && !session.expired;
        
        if(hasValidSession && !isHistoryMsg){
            session.newMessageArrived(message);
            return;
        }

        if(isHistoryMsg){
            session = new TransformSession(message, clearSession(message.from().id));
            sessions[sourceId] = session;
            session.start();
            return;
        }else{
            clearSession(message.from().id)();
            process.nextTick(() => {
                reply(message, notice.notHistory);
            });
        }
    }catch(err){
        console.warn('消息处理出错：');
        console.warn(err);
        process.nextTick(() => {
            reply(message, notice.error);
        });
    }

    function reply(msg: Message, text: string){
        BotManager.sendMessageToContact(
            msg.to().id,
            msg.from().id,
            text);
    }
};


