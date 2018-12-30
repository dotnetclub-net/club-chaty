import { ChatyBot, ChatyBotStatus } from "./wechaty-bot";
import { FileBox } from "wechaty";


let botInstance : ChatyBot = null;

function isBotReady() : boolean {
    return !!botInstance && !!(botInstance.getStatus().logged_in);
}

export let getStatus = function() : ChatyBotStatus {
    if(!botInstance){
        return {
            logged_in: false,
            account_id: null,
            login_time: null
        };
    }

    return botInstance.getStatus();
};

export let start = function(callback: Function){
    if(isBotReady()){
        callback();
        return;
    }

    // todo: pending
    botInstance = new ChatyBot(callback);
};

export let stop = function(callback : Function){
    // todo: pending

    if(isBotReady()){
        botInstance.stop(callback);
        botInstance = null;
    }else{
        callback();
    }
};

export let sendMessageToContact = function(selfId: string, toId : string, text: string){
    if(!isBotReady()){
        throw new Error(`无法回复 ${toId}，因为当前还没有登录微信。`); 
    }
    
    const status = getStatus();
    if(status.account_id !== selfId){
        throw new Error(`无法回复 ${toId}，因为当前登录的微信用户不是 ${selfId}，当前登录的是 ${status.account_id}。`);
    }

    botInstance.sendMessage(toId, text);
};

export interface CdnDownloadableFile {
    attachmentCdnUrl: string,
    aesKey: string,
    totalLength: string
}

export let supportsDownloadAttachmentLocally = function(){
    return isBotReady() && botInstance.supportsDownloadAttachmentLocally();
};

export let downloadFile = function(payload: CdnDownloadableFile) : Promise<FileBox> {
    if(supportsDownloadAttachmentLocally()){
        return botInstance.downloadAttachment(payload.attachmentCdnUrl, payload.aesKey, payload.totalLength);
    }else{
        return Promise.reject('当前状态无法下载文件：未登录，或者不支持直接下载。');
    }
};



// todo: support video?   : padchat: true, padpro: false
// todo: support attachment?   : padchat: false, padpro: true