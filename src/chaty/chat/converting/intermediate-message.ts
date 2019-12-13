import ChatMessage from "../messages/chat-message";
import { AdditionalMessageHanlder } from "./additinal-message-handler";
import * as BotManager from "../../bot/bot-manager"


export default abstract class IntermediateMessage {
    protected _xmlObj : any;
    protected _resourceLocator : any;
    constructor(xmlObj: any, resourceLocator: any){
        this._xmlObj = xmlObj;
        this._resourceLocator = resourceLocator;
    }

    abstract getConvertedMessage() : Promise<ChatMessage>;
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
    
    static canDownloadDirectly(message: IntermediateMessage): boolean {
        return (message._resourceLocator || message._resourceLocator[message._xmlObj.cdndataurl])
                || BotManager.supportsDownloadingDirectly()
    }
}