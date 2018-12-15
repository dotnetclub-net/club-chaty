import * as EventEmitter from 'events'
import { ChatMessage, ForwardedMessageList } from './chat-message';

export default class ChatMessageBus {
    private _eventEmitter : EventEmitter;

    constructor(){
        this._eventEmitter = new EventEmitter();
    }

    subscribe(callback: ((msgList:ForwardedMessageList)=> void) ): void{
        this._eventEmitter.on('message', (msgList: ForwardedMessageList) => {
            setImmediate(() => {
                callback(msgList);
            });
        });
    }

    publish(msgList: ForwardedMessageList): void {
        this._eventEmitter.emit('message', msgList);
    }
}
  