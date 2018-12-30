import { ChatyBot, ChatyBotStatus } from "./wechaty-bot";


let botInstance : ChatyBot = null;

export let getStatus = function() : ChatyBotStatus {
    if(botInstance == null){
        return {
            logged_in: false,
            account_id: null,
            login_time: null
        };
    }

    return botInstance.getStatus();
};

export let start = function(callback: Function){
    if(botInstance != null){
        callback();
        return;
    }

    botInstance = new ChatyBot(callback);
};

export let stop = function(callback : Function){
    if(botInstance != null){
        botInstance.stop(callback);
        botInstance = null;
    }else{
        callback();
    }
};

export let sendMessageToContact = function(selfId: string, toId : string, text: string){
    const status = getStatus();

    if(botInstance == null || !status.logged_in){
        throw new Error(`无法回复 ${toId}，因为当前还没有登录微信。`); 
    }

    if(status.account_id !== selfId){
        throw new Error(`无法回复 ${toId}，因为当前登录的微信用户不是 ${selfId}，当前登录的是 ${status.account_id}。`);
    }

    botInstance.sendMessage(toId, text);
};

export let downloadFile = function(payload){
    if(botInstance != null){
        botInstance.downloadAttachment(payload.cdnattachurl, payload.aeskey, payload.totallen);
    }
};