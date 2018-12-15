import { ChatMessage, ChatMessageContent, MessageType } from "./chat-message";


export function convertToMessageList(text: string, sourceId: string) : ChatMessage[]{
    var message = new ChatMessage();
    message.sourceTime = new Date().toString();
    message.wechatId = sourceId;
    
    // todo: 转换 history 类型的消息
    message.content = new ChatMessageContent(MessageType.Text);
    message.content.textContent = text;

    return [ message ];
}