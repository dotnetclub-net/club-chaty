
import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import {AdditionalMessageHanlder, FileAdditionalMessageHandler, IUseFileMessage } from '../additinal-message-handler'
import { FileBox } from "wechaty";
import * as ChatStore from '../../chat-store';
import { FileChatMessageContent } from "../../messages/message-content";
import * as BotManager from "../../../bot/bot-manager"
import { MessageType as WeChatyMessageType } from "wechaty-puppet";
import { CDNFileType } from "../../../bot/wechaty-bot";

export class AttachmentMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return type === HistoryMessageType.Attachment;
    }
    
    convertFromXML(parsedXMLObj: any, resourceLocator: any): IntermediateMessage {
        return new AttachmentMessage(parsedXMLObj, resourceLocator);
    }
}


export class AttachmentMessage extends IntermediateMessage implements IUseFileMessage  {

    private _converted : ChatMessage;
    private _additionalMsgHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any, resourceLocator: any){
        super(xmlObj, resourceLocator);

        this._additionalMsgHandler = new FileAdditionalMessageHandler('文件', this, [ WeChatyMessageType.Attachment ]);
    }

    async getConvertedMessage(): Promise<ChatMessage> {
        let downloadedBuffer: Buffer;
        if(!this._converted && this._resourceLocator[this._xmlObj.cdndataurl]){
            const fileBox = FileBox.fromUrl(this._resourceLocator[this._xmlObj.cdndataurl]);
            downloadedBuffer = await fileBox.toBuffer();
        }

        if(!this._converted && BotManager.supportsDownloadingDirectly()){
            const file = await BotManager.downloadFile({
                cdnFileId: this._xmlObj.cdndataurl,
                aesKey: this._xmlObj.cdndatakey,
                totalLength: parseInt(this._xmlObj.datasize),
                fileType: CDNFileType.ATTACHMENT
            });
            downloadedBuffer = await file.toBuffer();
        }

        if(downloadedBuffer){
            const fileId = ChatStore.storeFile(downloadedBuffer);
            
            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, this._xmlObj.datatitle, HistoryMessageType.Attachment);
            this._converted = message;
        }

        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return IntermediateMessage.canDownloadDirectly(this) ? null : this._additionalMsgHandler;
    }

    async messagefileDownloaded(messageFile: FileBox): Promise<void> {
        this._additionalMsgHandler = null;

        const buffer = await messageFile.toBuffer();
        const fileId = ChatStore.storeFile(buffer);
        const message = this.getMetaMessage();
        message.content = new FileChatMessageContent(fileId, messageFile.name, HistoryMessageType.Attachment);
        
        this._converted = message;
    }
}
