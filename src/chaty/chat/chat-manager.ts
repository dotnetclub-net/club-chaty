import MessageBus from './event-bus'
import { ChatMessage, ForwardedMessageList, ChatMessageContent, MessageType } from './chat-message';
import * as ChatStore from './chat-store';
import { convertToMessageList } from './converter';

const messageBus = new MessageBus();
const notice = {
    success: '已收到你的消息 [Grin]',
    notInChat: '你不是对话的参与者，请不要转发他人的对话 [Angry]',
    error: '转换出错 [Awkward]'
};



export let enqueue = function(sourceId: string, text: string, callback : ((reply: string) => void)): void {
    process.nextTick(function(){
        try{
            const messages = convertToMessageList(text, sourceId);
            const forwaredMessages = new ForwardedMessageList(sourceId, messages);
            
            messageBus.publish(forwaredMessages);
            callback(notice.success);
        }catch(err){
            console.warn('转换消息出错：');
            console.warn(err);

            callback(notice.error);
        }
    });
};


messageBus.subscribe(function(forwaredMessages : ForwardedMessageList){
    ChatStore.store(forwaredMessages.forwarderWeChatId, forwaredMessages.messages);
});

export let onMessage = function(callback : ((msgList: ForwardedMessageList) => void)): void {
   messageBus.subscribe(callback);
}
