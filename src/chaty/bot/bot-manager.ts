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

// export let getImage = function(payload){
//     if(botInstance != null){
//         botInstance.getImage(payload);
//     }
// };