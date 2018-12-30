import { MessageType } from "../messages/message-type";
import ConvertedMessage from "./converted-message";

export default abstract class BaseConverter{
    abstract supportsType(type: MessageType, parsedXMLObj: any) : boolean;
    abstract convert(parsedXMLObj: any) : ConvertedMessage;
}


// Text Url Image Emoticon Attachment Audio Video  ChatHistory
// 1    5    2      1         8               4       17



// function getMessageText(msg: any) : string {
//     if(msg.datadesc){
//         return msg.datadesc;
//     }

//     if(msg.datafmt === 'pic'){
//         return '[图片]';
//     }

//     return '[不支持的消息]';
// }