import { HistoryMessageType } from "../messages/message-type";
import ConvertedMessage from "./converted-message";

export default abstract class BaseConverter{
    abstract supportsType(type: HistoryMessageType, parsedXMLObj: any) : boolean;
    abstract convert(parsedXMLObj: any) : ConvertedMessage;
}