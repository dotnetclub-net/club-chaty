import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import {AdditionalMessageHanlder, FileAdditionalMessageHandler, IUseFileMessage } from '../additinal-message-handler'
import { FileBox } from "wechaty";
import * as ChatStore from '../../chat-store';
import { FileChatMessageContent } from "../../messages/message-content";
import { MessageType as WeChatyMessageType } from "wechaty-puppet";
import * as BotManager from "../../../bot/bot-manager"
import { CDNFileType } from "../../../bot/wechaty-bot";

export class VideoMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return type === HistoryMessageType.Video;
    }
    
    convertFromXML(parsedXMLObj: any, resourceLocator: any): IntermediateMessage {
        return new VideoMessage(parsedXMLObj, resourceLocator);
    }
}


export class VideoMessage extends IntermediateMessage implements IUseFileMessage  {

    private _converted : ChatMessage;
    private _additionalMsgHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any, resourceLocator: any){
        super(xmlObj, resourceLocator);

        this._additionalMsgHandler = new FileAdditionalMessageHandler('视频', this, [WeChatyMessageType.Video]);
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
                fileType: CDNFileType.VIDEO
            });
            downloadedBuffer = await file.toBuffer();
        }

        if(downloadedBuffer){
            const fileId = ChatStore.storeFile(downloadedBuffer);

            const message = this.getMetaMessage();
            const date = new Date().getTime();
            message.content = new FileChatMessageContent(fileId, `video-${date}`, HistoryMessageType.Video);
            this._converted = message;
        }

        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return IntermediateMessage.canDownloadDirectly(this) ? null : this._additionalMsgHandler;
    }

    async messagefileDownloaded(messageFile: FileBox): Promise<void>  {
        this._additionalMsgHandler = null;

        const buffer = await messageFile.toBuffer();
        const fileId = ChatStore.storeFile(buffer);
        
        const message = this.getMetaMessage();
        message.content = new FileChatMessageContent(fileId, messageFile.name, HistoryMessageType.Video);
        
        this._converted = message;
    }
}
