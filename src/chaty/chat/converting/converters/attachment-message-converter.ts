
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
    
    convertFromXML(parsedXMLObj: any): IntermediateMessage {
        return new AttachmentMessage(parsedXMLObj);
    }
}


export class AttachmentMessage extends IntermediateMessage implements IUseFileMessage  {

    private _converted : ChatMessage;
    private _additionalMsgHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any){
        super(xmlObj);

        this._additionalMsgHandler = new FileAdditionalMessageHandler('文件', this, [ WeChatyMessageType.Attachment ]);
    }

    async getConvertedMessage(): Promise<ChatMessage> {
        if(!this._converted && BotManager.supportsDownloadingDirectly()){
            const file = await BotManager.downloadFile({
                cdnFileId: this._xmlObj.cdndataurl,
                aesKey: this._xmlObj.cdndatakey,
                totalLength: parseInt(this._xmlObj.datasize),
                fileType: CDNFileType.ATTACHMENT
            });
            const buffer = await file.toBuffer();
            const fileId = ChatStore.storeFile(buffer);
            
            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, this._xmlObj.datatitle, HistoryMessageType.Attachment);
            this._converted = message;
        }

        return this._converted;
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return BotManager.supportsDownloadingDirectly() ? null : this._additionalMsgHandler;
    }

    messagefileDownloaded(messageFile: FileBox): void {
        this._additionalMsgHandler = null;

        messageFile.toBuffer().then((buffer) => {
            const fileId = ChatStore.storeFile(buffer);
           
            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, messageFile.name, HistoryMessageType.Attachment);
            
            this._converted = message;
        });
    }
}
