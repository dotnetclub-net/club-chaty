import { HistoryMessageType } from "./message-type";

export default abstract class ChatMessageContent {
    private _type : HistoryMessageType;

    constructor(type: HistoryMessageType){
        this._type = type;
    }

    get type() : HistoryMessageType {
        return this._type;
    }
}
