import { ChatyBot, ChatyBotState, ChatyBotStatus, CDNFileType } from "./wechaty-bot";
import { FileBox } from "wechaty";


let botInstance : ChatyBot = null;

function isBotReady() : boolean {
    return !!botInstance && !!(botInstance.getStatus().status === ChatyBotStatus.LoggedIn);
}

export let getStatus = function() : ChatyBotState {
    if(!botInstance){
        return {
            status: ChatyBotStatus.Unknown,
            account_id: null,
            login_time: null,
            login_qrcode: null
        };
    }

    return botInstance.getStatus();
};

export let start = function(callback: Function){
    const curStatus = getStatus().status;

    if(curStatus === ChatyBotStatus.WaitingForScan){
        callback(botInstance.loginQRCode);
        return;
    }

    if(curStatus >= ChatyBotStatus.Starting){
        callback();
        return;
    }
    
    botInstance = new ChatyBot(callback);
};

export let stop = function(callback : Function){
    if(!isBotReady()){
        callback();
        return;
    }
    
    botInstance.stop(callback);
    botInstance = null;
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
    cdnFileId: string,
    aesKey: string,
    totalLength: number,
    fileType: CDNFileType
}

export let supportsDownloadingDirectly = function(){
    return isBotReady() && botInstance.supportsDownloadingDirectly();
};

export let downloadFile = function(payload: CdnDownloadableFile) : Promise<FileBox> {
    if(supportsDownloadingDirectly()){
        return botInstance.downloadFile(payload.cdnFileId, payload.aesKey, payload.totalLength, payload.fileType);
    }else{
        return Promise.reject('当前状态无法下载文件：未登录，或者不支持直接下载。');
    }
};



// todo: support video?   : padchat: true, padpro: false
// todo: support attachment?   : padchat: false, padpro: true