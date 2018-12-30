
import ConvertedMessage from "../converted-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import AdditionalMessageHanlder from '../additinal-message-handler'
import { UrlMessageContent } from "../../messages/message-content";



export class UrlMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return false;
        // todo: support URL analyzing...
        // return type === HistoryMessageType.Url;
    }
    
    convert(parsedXMLObj: any): ConvertedMessage {
        return new UrlConvertedMessage(parsedXMLObj);
    }
}


export class UrlConvertedMessage extends ConvertedMessage {
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