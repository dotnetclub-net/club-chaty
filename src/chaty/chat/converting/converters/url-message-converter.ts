
import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import AdditionalMessageHanlder from '../additinal-message-handler'
import { UrlChatMessageContent } from "../../messages/message-content";



export class UrlMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return false;
        // todo: support URL analyzing...
        // return type === HistoryMessageType.Url;
    }
    
    convertFromXML(parsedXMLObj: any): IntermediateMessage {
        return new UrlMessage(parsedXMLObj);
    }
}


export class UrlMessage extends IntermediateMessage {
    private _converted : ChatMessage;

    constructor(_xmlObj: any){
        super(_xmlObj);

        const message = this.getMetaMessage();
        // todo: parse url
        // message.content = new UrlMessageContent(this._xmlObj.datadesc);
        this._converted = message;
    }
    
    getConvertedMessage(): ChatMessage {
        return this._converted;
    }

    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return null;
    }
}