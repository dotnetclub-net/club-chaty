
import ConvertedMessage from "../converted-message";
import { HistoryMessageType } from "../../messages/message-type";
import { MessageType as WeChatyMessageType } from 'wechaty-puppet';
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import AdditionalMessageHanlder from '../additinal-message-handler'
import { Message, FileBox } from "wechaty";
import * as ChatStore from '../../chat-store';
import { ImageMessageContent } from "../../messages/message-content";


export class ImageMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        if(type === HistoryMessageType.Image){
            return true;
        }

        // Question: 如果用户想跳过表情？
        if(type === HistoryMessageType.Text){
            return '[表情]' === parsedXMLObj.datadesc || 
                   '[Sticker]' === parsedXMLObj.datadesc ;
        }

        return false;
    }
    
    convert(parsedXMLObj: any): ConvertedMessage {
        return new ImageConvertedMessage(parsedXMLObj);
    }
}


export class ImageConvertedMessage extends ConvertedMessage {
    private _converted : ChatMessage;
    private _additionalImageHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any){
        super(xmlObj);

        let handlerName = '图片';
        const isEmotion = '[表情]' === xmlObj.datadesc ||  '[Sticker]' === xmlObj.datadesc ;
        if(isEmotion){
            handlerName = '表情';
        }
        
        this._additionalImageHandler = new ImageAdditionalMessageHandler(handlerName, this);
    }
    
    getConvertedMessage(): ChatMessage {
        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return this._additionalImageHandler;
    }

    imageDownloaded(imageFile: FileBox) {
        this._additionalImageHandler = null;

        imageFile.toBuffer().then((buffer) => {
            const fileId = ChatStore.storeFile(buffer);
           
            const message = this.getMetaMessage();
            message.content = new ImageMessageContent(fileId, imageFile.name);
            
            this._converted = message;
        });
    }
}

class ImageAdditionalMessageHandler implements AdditionalMessageHanlder{

    private _name : string;
    private _convertingMessage: ImageConvertedMessage;
    constructor(name: string, convertingMessage: ImageConvertedMessage) {
        this._name = name;
        this._convertingMessage = convertingMessage;
    }

    accept(message: Message): boolean {
        if(message.type() !== WeChatyMessageType.Image){
            return false;
        }

        message.toFileBox().then(async (fileBox)=> {
            this._convertingMessage.imageDownloaded(fileBox);
        });
        return true;
    }
    
    get name(): string{
        return this._name;
    }
}