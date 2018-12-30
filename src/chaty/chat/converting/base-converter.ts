import { HistoryMessageType } from "../messages/message-type";
import IntermediateMessage from "./intermediate-message";

export default abstract class BaseConverter{
    abstract supportsType(type: HistoryMessageType, parsedXMLObj: any) : boolean;
    abstract convertFromXML(parsedXMLObj: any) : IntermediateMessage;
}