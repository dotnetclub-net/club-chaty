
import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import AdditionalMessageHanlder from '../additinal-message-handler'
import { TextChatMessageContent as TextChatMessageContent } from "../../messages/message-content";



export class TextMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return type === HistoryMessageType.Text || type === HistoryMessageType.Url;
    }
    
    convertFromXML(parsedXMLObj: any): IntermediateMessage {
        return new TextMessage(parsedXMLObj);
    }
}


export class TextMessage extends IntermediateMessage {
    private _converted : ChatMessage;

    constructor(_xmlObj: any){
        super(_xmlObj);

        const message = this.getMetaMessage();
        message.content = new TextChatMessageContent(this._xmlObj.datadesc || this._xmlObj.datatitle);
        this._converted = message;
    }
    
    getConvertedMessage(): ChatMessage {
        return this._converted;
    }

    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return null;
    }
}