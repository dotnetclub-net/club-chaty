import { Message } from "wechaty";
import * as BotManager from "../bot/bot-manager"
import RawChatHistoryMessage from "./messages/raw-history-message";
import { MessageType } from "wechaty-puppet";
import ChatMessage from "./messages/chat-message";
import { TextChatMessageContent } from "./messages/message-content";
import * as ChatStore from './chat-store';
import * as parser from './history-message-text-parser';
import IntermediateMessage from "./converting/intermediate-message";
import { ImageMessageConverter } from './converting/converters/image-message-converter';
import { UrlMessageConverter } from './converting/converters/url-message-converter';
import { TextMessageConverter, TextMessage } from "./converting/converters/text-message-converter";
import { VideoMessageConverter } from "./converting/converters/video-message-converter";
import { AttachmentMessageConverter } from "./converting/converters/attachment-message-converter";


const notice = {
    started: '消息已收到 [Grin]',
    completed: '转换完成 [Smart]',
    notInChat: '你不是对话的参与者，请不要转发他人的对话 [Angry]'
}


interface ConvertState {
    allReceived: boolean,
    hasMissingItems: boolean,
    missingItems: any
}

var allConverters = [
    new VideoMessageConverter(),
    new ImageMessageConverter(),
    new AttachmentMessageConverter(),
    new UrlMessageConverter(),
    new TextMessageConverter()
];

export default class ConversionSession {
    private _historyMessage: RawChatHistoryMessage;
    private _intermediateMessages: IntermediateMessage[];
    private _resourceUrls : any;
    private _onCompleted: Function;
    private _createdTime: Date;
    private _converted: boolean;

    constructor(historyMessage: Message, onCompleted: Function) {
        this._historyMessage = new RawChatHistoryMessage(
            historyMessage.from().id,
            historyMessage.to().id,
            historyMessage.text());

        this._onCompleted = onCompleted || (() => { });
        this._createdTime = new Date();
    }

    start(): void {
        const texts = parser.readXMLPayload(this._historyMessage.text);
        this._resourceUrls = parser.extractResourcesFromXML(texts.resourceText);
        this._intermediateMessages = this.parseAsIntermediateMessages(texts.messageText);

        const state = this.getLatestState();
        if (!state.hasMissingItems) {
            this.convert();
            return;
        }

        this.reply(notice.started);
        let msg = '有些内容需要单独传过来：\n';
        for (const key in state.missingItems) {
            const count = state.missingItems[key];
            msg += `${count}个${key}\n`;
        }
        msg += '请按顺序提供这些内容，如果不想提供，请回复“直接转换”或“取消”。';
        this.reply(msg);
    }

    async newMessageArrived(message: Message): Promise<void> {
        if (message.type() === MessageType.Text) {
            switch (message.text()) {
                case '直接转换':
                    this.convert();
                    return;
                case '取消':
                    this._onCompleted();
                    return;
                default:
                    const msg = '请按顺序提供内容，如果不想提供，请回复“直接转换”或“取消”。';
                    this.reply(msg);
                    return;
            }
        }

        let acceptedAs: string = '';

        const incompleteMessage = this._intermediateMessages
            .filter(m => m.additionalMessageHanlder != null)
            .find(m => m.additionalMessageHanlder.willAccept(message));

        if (!!incompleteMessage) {
            acceptedAs = incompleteMessage.additionalMessageHanlder.name;
            await incompleteMessage.additionalMessageHanlder.accept(message);
        }

        const currentState = this.getLatestState();
        if (currentState.allReceived) {
            this.convert();
            return;
        }

        if (currentState.hasMissingItems) {
            if (!!acceptedAs) {
                let msg = `收到1个${acceptedAs}，还缺少：`;
                for (const key in currentState.missingItems) {
                    const count = currentState.missingItems[key];
                    msg += `${count}个${key}\n`;
                }
                msg += '请按顺序提供这些内容，如果不想提供，请回复“直接转换”或“取消”。';
                this.reply(msg);
            }
            else {
                this.reply('请按顺序提供缺少的内容，如果不想提供，请回复“直接转换”或“取消”。');
            }
        }else{
            this.reply('一些内容还在下载中，下载完成后，转换过程会自动开始。');
        }
    }

    private parseAsIntermediateMessages(messageText: string): IntermediateMessage[] {
        const msgItems: any[] = parser.extractMessagesFromXML(messageText);

        return msgItems.map(msgXMLObj => {
            const converter = allConverters.find((c) => {
                const typeVal = parseInt(msgXMLObj['@'].datatype);
                return c.supportsType(typeVal, msgXMLObj);
            });

            if (!converter) {
                // 不支持的消息，使用文本类型，显示原始提示
                return new TextMessage(msgXMLObj, this._resourceUrls);
            }

            return converter.convertFromXML(msgXMLObj, this._resourceUrls);
        });
    }

    private async convert(): Promise<void> {
        if (this._converted) {
            return;
        }

        const convertingTasks: Promise<ChatMessage>[] = this._intermediateMessages.map(msg => {
            if (!msg.additionalMessageHanlder) {
                return msg.getConvertedMessage();
            } else {
                const skipped = IntermediateMessage.buildMetaMessage(msg.originalXMLObject);
                skipped.content = new TextChatMessageContent(`[${msg.additionalMessageHanlder.name}]`);
                return Promise.resolve(skipped);
            }
        });

        this._converted = true;
        let converted = await Promise.all(convertingTasks);
        converted = converted.filter(m => !!m);

        const chatId = ChatStore.store(this._historyMessage.fromId, converted);
        this.reply(notice.completed + `\n会话 Id:${this._historyMessage.fromId}/${chatId}`);
        this._onCompleted();
    }

    private getLatestState(): ConvertState {
        const incompleteMessages = this._intermediateMessages.filter(m => !!m.additionalMessageHanlder);
        const notFullFilledMessages = incompleteMessages.filter(m => !m.additionalMessageHanlder.isAccepting);
        const stat: any = {};
        notFullFilledMessages.forEach((cur) => {
            const handlerName = cur.additionalMessageHanlder.name;
            stat[handlerName] = (stat[handlerName] || 0) + 1;
        });

        return {
            allReceived: incompleteMessages.length == 0,
            hasMissingItems: notFullFilledMessages.length > 0,
            missingItems: stat
        }
    }

    private reply(text : string): void {
        BotManager.sendMessageToContact(
            this._historyMessage.toId,
            this._historyMessage.fromId,
            text);
    }


    get createdAt(): Date {
        return this._createdTime;
    }

    get expired(): boolean {
        const sessionExpire = 600 * 1000; // 10 分钟

        const timeElapsed = new Date().getTime() - this.createdAt.getTime();
        return timeElapsed > sessionExpire;
    }
}
