import { MessageType } from "wechaty-puppet";

export class ChatMessageContent {
    private _type : MessageType;
    private _textContent: string;

    constructor(type: MessageType){
        this._type = type;
    }

    get type() : MessageType {
        return this._type;
    }

    get textContent() : string {
        return this._textContent;
    }

    set textContent(val) {
        this._textContent = val;
    }
}


export class ChatMessage{
    private _sourceName: string;
    private _sourceTime: string;
    private _sourceUserId: string;

    private _content : ChatMessageContent;


    get sourceName() : string {
        return this._sourceName;
    }

    set sourceName(val) {
         this._sourceName = val;
    }


    get sourceTime() : string {
        return this._sourceTime;
    }

    set sourceTime(val) {
         this._sourceTime = val;
    }

    get sourceUserId() : string {
        return this._sourceUserId;
    }

    set sourceUserId(val) {
         this._sourceUserId = val;
    }

    get text() : string {
        return this._content == null ? null : this._content.textContent;
    }

    get content() : ChatMessageContent {
        return this._content;
    }

    set content(val) {
         this._content = val;
    }
}


export class ForwardedMessageList {
    private _forwarderWeChatId : string;
    private _messages: ChatMessage[];

    constructor(forwarderWeChatId: string, messages: ChatMessage[]){
        this._forwarderWeChatId = forwarderWeChatId;
        this._messages = messages;
    }

    get forwarderWeChatId(): string{
        return this._forwarderWeChatId;
    }

    get messages(): ChatMessage[] {
        return this._messages;
    }

    static isInChat(messages: ChatMessage[], wechatId: string): boolean{
        return messages.some(msg => msg.sourceUserId == wechatId);
    }
}