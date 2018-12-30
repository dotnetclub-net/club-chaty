import ChatMessage from "../messages/chat-message";
import AdditionalMessageHanlder from "./additinal-message-handler";


export default abstract class IntermediateMessage {
    protected _xmlObj : any;
    constructor(xmlObj: any){
        this._xmlObj = xmlObj;
    }

    abstract getConvertedMessage() : ChatMessage;
    abstract get additionalMessageHanlder() : AdditionalMessageHanlder;

    get originalXMLObject(){
        return this._xmlObj;
    }
    
    protected getMetaMessage(): ChatMessage {
        return IntermediateMessage.buildMetaMessage(this._xmlObj);
    }

    static buildMetaMessage(xmlObj: any){
        const message = new ChatMessage();

        message.sourceUserId = xmlObj.dataitemsource.fromusr || xmlObj.dataitemsource.realchatname;
        message.sourceName = xmlObj.sourcename;
        message.sourceTime = xmlObj.sourcetime;
        message.sourceTimestamp = xmlObj.srcMsgCreateTime;
        
        return message;
    }
}