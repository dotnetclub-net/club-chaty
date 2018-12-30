import * as xmlParser from 'fast-xml-parser';
import { TextMessageConverter } from "./converters/text-message-converter";
import ConvertedMessage from './converted-message';

function parseAsMsgCollection(msgText) : any {
    const msgObj = xmlParser.parse(msgText);
    const recordListXmlText = msgObj.msg.appmsg.recorditem;
    return xmlParser.parse(recordListXmlText);
}


var allConverters = [
    new TextMessageConverter()
];


export function convertToMessageList(text: string) : ConvertedMessage[] {
    const msgCollection = parseAsMsgCollection(text);
    const msgItems : any[] = msgCollection.recordinfo.datalist.dataitem;
    return msgItems.map(msg => {
        const converter = allConverters.find((c) => {
            // todo: number -> MessageType
           return c.supportsType(msg.type, msg);
        });

        if(converter == null){
            throw new Error('不支持的消息');
        }

        return converter.convert(msg);
    });
}
