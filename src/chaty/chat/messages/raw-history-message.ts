
export default class RawChatHistoryMessage{
    private _text: string;
    private _fromId: string;
    private _toId: string;
    
    constructor(fromId : string, toId : string, text: string){
        this._fromId = fromId;
        this._toId = toId;
        this._text = text;
    }

    get text(){
        return this._text;
    }

    get fromId(){
        return this._fromId;
    }

    get toId(){
        return this._toId;
    }
}