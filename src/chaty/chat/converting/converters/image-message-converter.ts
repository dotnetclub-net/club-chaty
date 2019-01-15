
import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import { MessageType as WeChatyMessageType } from 'wechaty-puppet';
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import { IUseFileMessage, FileAdditionalMessageHandler, AdditionalMessageHanlder } from '../additinal-message-handler'
import { FileBox } from "wechaty";
import * as BotManager from "../../../bot/bot-manager"
import * as ChatStore from '../../chat-store';
import { FileChatMessageContent } from "../../messages/message-content";
import { CDNFileType } from "../../../bot/wechaty-bot";


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
    
    convertFromXML(parsedXMLObj: any): IntermediateMessage {
        return new ImageMessage(parsedXMLObj);
    }
}


export class ImageMessage 
            extends IntermediateMessage 
            implements IUseFileMessage {
    private _converted : ChatMessage;
    private _additionalImageHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any){
        super(xmlObj);

        let handlerName = '图片';
        const isEmotion = '[表情]' === xmlObj.datadesc ||  '[Sticker]' === xmlObj.datadesc;
        if(isEmotion){
            handlerName = '表情';
        }
        
        this._additionalImageHandler = new FileAdditionalMessageHandler(handlerName, this, [WeChatyMessageType.Image, WeChatyMessageType.Emoticon]);
    }
    
    async getConvertedMessage(): Promise<ChatMessage> {
        if (!this._converted && BotManager.supportsDownloadingDirectly()) {
            const file = await BotManager.downloadFile({
                cdnFileId: this._xmlObj.cdndataurl,
                aesKey: this._xmlObj.cdndatakey,
                totalLength: parseInt(this._xmlObj.datasize),
                fileType: CDNFileType.IMAGE
            });
            const buffer = await file.toBuffer();
            const fileId = ChatStore.storeFile(buffer);

            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, file.name, HistoryMessageType.Image);
            this._converted = message;
        }

        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return BotManager.supportsDownloadingDirectly() ? null : this._additionalImageHandler;
    }

    messagefileDownloaded(imageFile: FileBox) {
        this._additionalImageHandler = null;

        imageFile.toBuffer().then((buffer) => {
            const fileId = ChatStore.storeFile(buffer);
           
            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, imageFile.name, HistoryMessageType.Image);
            
            this._converted = message;
        });
    }
}
