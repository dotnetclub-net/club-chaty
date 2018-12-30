import * as xmlParser from 'fast-xml-parser';
import ConvertedMessage from './converted-message';
import { ImageMessageConverter } from './converters/image-message-converter';
import { UrlMessageConverter } from './converters/url-message-converter';
import { TextMessageConverter } from "./converters/text-message-converter";

function parseAsMsgCollection(msgText) : any {
    const msgObj = xmlParser.parse(msgText);
    const recordListXmlText = msgObj.msg.appmsg.recorditem;
    return xmlParser.parse(recordListXmlText);
}


var allConverters = [
    new ImageMessageConverter(),
    new UrlMessageConverter(),
    new TextMessageConverter()
];


export function convertToMessageList(text: string) : ConvertedMessage[] {
    const msgCollection = parseAsMsgCollection(text);
    const msgItems : any[] = msgCollection.recordinfo.datalist.dataitem;
    return msgItems.map(msg => {
        const converter = allConverters.find((c) => {
            const typeVal = parseInt(msg.type);
            return c.supportsType(typeVal, msg);
        });

        if(converter == null){
            throw new Error('不支持的消息');
        }

        return converter.convert(msg);
    });
}
