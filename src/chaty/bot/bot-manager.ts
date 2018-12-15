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

    return botInstance.getStatus()
};

export let start = function(scanCb){
    if(botInstance != null){
        return;
    }

    botInstance = new ChatyBot(scanCb);
};

export let stop = function(){
    if(botInstance != null){
        botInstance.stop();
    }
    botInstance = null;
};