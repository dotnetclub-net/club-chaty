import { ChatMessage, ChatMessageContent } from "./chat-message";
import { MessageType } from "wechaty-puppet";
import * as xmlParser from 'fast-xml-parser';

function parseAsMsgCollection(msgText){
    const msgObj = xmlParser.parse(msgText);
    const recordListXmlText = msgObj.msg.appmsg.recorditem;
    return xmlParser.parse(recordListXmlText);
}

function getMessageText(msg: any) : string {
    if(msg.datadesc){
        return msg.datadesc;
    }

    if(msg.datafmt === 'pic'){
        return '[图片]';
    }

    return '[不支持的消息]';
}

export function convertToMessageList(text: string) : ChatMessage[]{
    const msgCollection = parseAsMsgCollection(text);
    const msgItems : any[] = msgCollection.recordinfo.datalist.dataitem;
    const messages = msgItems.map(msg => {
        var message = new ChatMessage();

        message.sourceUserId = msg.dataitemsource.fromusr;
        message.sourceName = msg.sourcename;
        message.sourceTime = msg.sourcetime;
        
        message.content = new ChatMessageContent(MessageType.Text);
        message.content.textContent = getMessageText(msg);

        return message;
    });

    return messages;
}