import ChatMessageContent from "./chat-message-content";
import { HistoryMessageType } from "./message-type";

export class TextChatMessageContent extends ChatMessageContent {
    private _text: string;
    constructor(text : string){
        super(HistoryMessageType.Text);

        this._text = text;
    }

    get text() : string {
        return this._text;
    }
}

export class UrlChatMessageContent extends ChatMessageContent {
    private _link: string;
    private _title: string;
    private _description: string;


    constructor(link : string, title : string, description: string){
        super(HistoryMessageType.Url);

       this._link = link;
       this._title = title;
       this._description = description;
    }

    get link(): string {
        return this._link;
    }
    
    get title(): string {
        return this._title;
    }
    
    get description(): string {
        return this._description;
    }
}

export class ImageChatMessageContent extends ChatMessageContent {
    private _storageFileId: string;
    private _originalFileName: string;
    constructor(storageFileId : string, originalFileName: string){
        super(HistoryMessageType.Image);

        this._storageFileId = storageFileId;
        this._originalFileName = originalFileName;
    }

    get fileId() : string {
        return this._storageFileId;
    }

    get fileName() : string {
        return this._originalFileName;
    }
}