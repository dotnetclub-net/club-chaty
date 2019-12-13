import * as xmlParser from 'fast-xml-parser';

export function readXMLPayload(rawMsgText: string) : any {
    const resourceIndex = rawMsgText.indexOf('<chatRecordResolve>');
    const messageText = resourceIndex === -1 
                            ? rawMsgText  : rawMsgText.substr(0, resourceIndex)
    const resoureText = resourceIndex === -1 
                            ? '<chatRecordResolve>{}</<chatRecordResolve>' : rawMsgText.substr(resourceIndex);
    
    return {
        messageText: messageText,
        resourceText: '<?xml version=\"1.0\"?>\n' + resoureText
    };  
}


function parseXMLToMsgCollection(msgText): any {
    const xmlOptions = { attrNodeName: '@', attributeNamePrefix: '', ignoreAttributes: false };
    const msgObj = xmlParser.parse(msgText, xmlOptions);

    let recordListXmlText = msgObj.msg.appmsg.recorditem.replace(/^\s+/, '');
    if (recordListXmlText.startsWith('&lt;')){
        recordListXmlText = unescape(recordListXmlText);
    }
    return xmlParser.parse(recordListXmlText, xmlOptions);


    function unescape(text){
        return text.replace(/&apos;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
            .replace(/&amp;/g, '&')
            .replace(/&#x20;/g, ' ')
            .replace(/&#x0A;/g, '\n');
    }
}

export function extractMessagesFromXML(rawMsgText: string) : any[] {
    const msgCollection = parseXMLToMsgCollection(rawMsgText);
    return msgCollection.recordinfo.datalist.dataitem;
}


function parseChatRecordResolve(xmlText) : any {
    const xmlOptions = { attrNodeName: '@', attributeNamePrefix: '', ignoreAttributes: false };
    return xmlParser.parse(xmlText, xmlOptions);
}

export function extractResourcesFromXML(resourceText: string) : any {
    const resourceXmlObject = parseChatRecordResolve(resourceText);
    const resourceJson = resourceXmlObject.chatRecordResolve['#text'] || resourceXmlObject.chatRecordResolve;
    const resourceObj = JSON.parse(resourceJson) ;
    
    return resourceObj.fileUrl || {};
}