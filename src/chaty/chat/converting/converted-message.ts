import ChatMessage from "../messages/chat-message";
import AdditionalMessageHanlder from "./additinal-message-handler";


export default abstract class ConvertedMessage {
    protected _xmlObj : any;
    constructor(xmlObj: any){
        this._xmlObj = xmlObj;
    }

    abstract getNotSupportedText() : ChatMessage;
    abstract getConvertedMessage() : ChatMessage;
    abstract get additionalMessageHanlder() : AdditionalMessageHanlder;
}