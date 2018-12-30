import { Message, FileBox } from "wechaty";
import { MessageType } from "wechaty-puppet";

export interface AdditionalMessageHanlder {
    willAccept(message: Message): boolean;
    accept(message: Message): Promise<void>;
    isAccepting: boolean;
    name : string;
}

export interface IUseFileMessage {
    messagefileDownloaded(messageFile: FileBox): void;
}

export class FileAdditionalMessageHandler implements AdditionalMessageHanlder {
    private _accepting : boolean;
    private _name : string;
    private _convertingMessage: IUseFileMessage;
    private _acceptMessageTypes: MessageType[];

    constructor(name: string, convertingMessage: IUseFileMessage, acceptMessageTypes : MessageType[]) {
        this._name = name;
        this._convertingMessage = convertingMessage;
        this._acceptMessageTypes = acceptMessageTypes;
    }

    get isAccepting() : boolean {
        return this._accepting;
    }

    willAccept(message: Message): boolean{
        if(this._accepting){
            return false;
        }

        return this._acceptMessageTypes.indexOf(message.type()) > -1;
    }

    async accept(message: Message) : Promise<void> {
        this._accepting = true;
        
        const fileBox = await message.toFileBox();
        this._convertingMessage.messagefileDownloaded(fileBox);
    }
    
    get name(): string{
        return this._name;
    }
}