
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
        return type === HistoryMessageType.Image;
    }
    
    convertFromXML(parsedXMLObj: any, resourceLocator: any): IntermediateMessage {
        return new ImageMessage(parsedXMLObj, resourceLocator);
    }
}


export class ImageMessage 
            extends IntermediateMessage 
            implements IUseFileMessage {
    private _converted : ChatMessage;
    private _additionalImageHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any, resourceLocator: any){
        super(xmlObj, resourceLocator);

        let handlerName = '图片';
        const isEmotion = '[表情]' === xmlObj.datadesc ||  '[Sticker]' === xmlObj.datadesc;
        if(isEmotion){
            handlerName = '表情';
        }
        
        this._additionalImageHandler = new FileAdditionalMessageHandler(handlerName, this, [WeChatyMessageType.Image, WeChatyMessageType.Emoticon]);
    }
    
    async getConvertedMessage(): Promise<ChatMessage> {
        let downloadedBuffer: Buffer;
        if(!this._converted && this._resourceLocator[this._xmlObj.cdndataurl]){
            const fileBox = FileBox.fromUrl(this._resourceLocator[this._xmlObj.cdndataurl]);
            downloadedBuffer = await fileBox.toBuffer();
        }

        if (!this._converted && BotManager.supportsDownloadingDirectly()) {
            const file = await BotManager.downloadFile({
                cdnFileId: this._xmlObj.cdndataurl,
                aesKey: this._xmlObj.cdndatakey,
                totalLength: parseInt(this._xmlObj.datasize),
                fileType: CDNFileType.IMAGE
            });
            downloadedBuffer = await file.toBuffer();
        }

        if(downloadedBuffer){
            const fileId = ChatStore.storeFile(downloadedBuffer);

            const message = this.getMetaMessage();
            const date = new Date().getTime();
            message.content = new FileChatMessageContent(fileId, `picture-${date}`, HistoryMessageType.Image);
            this._converted = message;
        }

        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return IntermediateMessage.canDownloadDirectly(this) ? null : this._additionalImageHandler;
    }

    async messagefileDownloaded(imageFile: FileBox): Promise<void> {
        this._additionalImageHandler = null;

        const buffer = await imageFile.toBuffer();
        const fileId = ChatStore.storeFile(buffer);
        
        const message = this.getMetaMessage();
        message.content = new FileChatMessageContent(fileId, imageFile.name, HistoryMessageType.Image);
        
        this._converted = message;
    }
}
