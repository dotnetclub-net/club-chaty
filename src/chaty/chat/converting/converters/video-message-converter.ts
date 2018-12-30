import IntermediateMessage from "../intermediate-message";
import { HistoryMessageType } from "../../messages/message-type";
import BaseConverter from "../base-converter";
import ChatMessage from "../../messages/chat-message";
import {AdditionalMessageHanlder, FileAdditionalMessageHandler, IUseFileMessage } from '../additinal-message-handler'
import { FileBox } from "wechaty";
import * as ChatStore from '../../chat-store';
import { FileChatMessageContent, TextChatMessageContent } from "../../messages/message-content";
import { MessageType as WeChatyMessageType } from "wechaty-puppet";

export class VideoMessageConverter extends BaseConverter {
    supportsType(type: HistoryMessageType, parsedXMLObj: any): boolean {
        return type === HistoryMessageType.Video;
    }
    
    convertFromXML(parsedXMLObj: any): IntermediateMessage {
        return new VideoMessage(parsedXMLObj);
    }
}


export class VideoMessage extends IntermediateMessage implements IUseFileMessage  {

    private _converted : ChatMessage;
    private _additionalMsgHandler : AdditionalMessageHanlder;

    constructor(xmlObj: any){
        super(xmlObj);

        this._additionalMsgHandler = new FileAdditionalMessageHandler('视频', this, [WeChatyMessageType.Video]);
    }
    
    getConvertedMessage(): Promise<ChatMessage> {
        return Promise.resolve(this._converted);
    }
    
    get additionalMessageHanlder() : AdditionalMessageHanlder{
        return this._additionalMsgHandler;
    }

    messagefileDownloaded(messageFile: FileBox): void {
        this._additionalMsgHandler = null;

        messageFile.toBuffer().then((buffer) => {
            const fileId = ChatStore.storeFile(buffer);
           
            const message = this.getMetaMessage();
            message.content = new FileChatMessageContent(fileId, messageFile.name, HistoryMessageType.Video);
            
            this._converted = message;
        });
    }
}
