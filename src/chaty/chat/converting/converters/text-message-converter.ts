
import ConvertedMessage from "../converted-message";
import { MessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import ChatMessageContent from "../../messages/chat-message-content";
import AdditionalMessageHanlder from '../additinal-message-handler'



export class TextMessageConverter extends BaseConverter {
    supportsType(type: MessageType, parsedXMLObj: any): boolean {
        return type === MessageType.Text || type === MessageType.Url;
    }
    
    convert(parsedXMLObj: any): ConvertedMessage {
        return new TextConvertedMessage(parsedXMLObj);
    }
}


export class TextConvertedMessage extends ConvertedMessage {
    private _converted : ChatMessage;

    constructor(_xmlObj: object){
        super(_xmlObj);

        this._converted = this._convert();
    }

    private _convert(){
        var message = new ChatMessage();

        message.sourceUserId = this._xmlObj.dataitemsource.fromusr || this._xmlObj.dataitemsource.realchatname;
        message.sourceName = this._xmlObj.sourcename;
        message.sourceTime = this._xmlObj.sourcetime;
        
        message.content = new ChatMessageContent(MessageType.Text);
        // todo: 处理 URL 类型
        message.content.textContent = this._xmlObj.datadesc;
        
        return message;
    }

    getNotSupportedText(): ChatMessage {
        return null;
    }
    
    getConvertedMessage(): ChatMessage {
        return this._converted;
    }

    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return null;
    }
}