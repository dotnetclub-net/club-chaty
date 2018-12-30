import ChatMessageContent from "./chat-message-content";


export default class ChatMessage{
    private _sourceName: string;
    private _sourceTime: string;
    private _sourceTimestamp: string;
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

    get sourceTimestamp() : string {
        return this._sourceTimestamp;
    }

    set sourceTimestamp(val) {
         this._sourceTimestamp = val;
    }

    get sourceUserId() : string {
        return this._sourceUserId;
    }

    set sourceUserId(val) {
         this._sourceUserId = val;
    }

    get content() : ChatMessageContent {
        return this._content;
    }

    set content(val) {
         this._content = val;
    }
}