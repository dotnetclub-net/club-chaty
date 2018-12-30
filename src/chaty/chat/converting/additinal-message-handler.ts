import { Message } from "wechaty";

export default interface AdditionalMessageHanlder {
    accept(message: Message): boolean;
    name : string;
}