
import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import { AdditionalMessageHanlder } from '../additinal-message-handler'
import { TextChatMessageContent as TextChatMessageContent } from "../../messages/message-content";



export class TextMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return type === HistoryMessageType.Text || type === HistoryMessageType.Url;
    }
    
    convertFromXML(parsedXMLObj: any, resourceLocator: any): IntermediateMessage {
        return new TextMessage(parsedXMLObj, resourceLocator);
    }
}


export class TextMessage extends IntermediateMessage {
    private _converted : ChatMessage;

    constructor(xmlObj: any, resourceLocator: any){
        super(xmlObj, resourceLocator);

        const message = this.getMetaMessage();
        message.content = new TextChatMessageContent(this._xmlObj.datadesc || this._xmlObj.datatitle || this._xmlObj.title || this._xmlObj.desc  || this._xmlObj.des);
        this._converted = message;
    }
    
    getConvertedMessage(): Promise<ChatMessage> {
        return Promise.resolve(this._converted);
    }

    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return null;
    }
}