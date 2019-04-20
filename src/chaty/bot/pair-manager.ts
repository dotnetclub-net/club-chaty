import { Contact } from "wechaty";
import * as BotManager from "./bot-manager";

let pairing = {};

export function welcomeAndSendCode(selfId : string, newFriend: Contact) {
    const messages = [];
    const code = generateCode(newFriend.id);

    messages.push('欢迎绑定 dotnetclub 微信账号');
    messages.push(`请在网站上输入验证码：${code}`);
    messages.push('');
    messages.push('如需重新生成，请回复\'验证码\'');
    
    BotManager.sendMessageToContact(selfId, newFriend.id, messages.join('\n'));
}

export function tryHandleGenerateCodeMessage(selfId: string, fromId: string, message : string) : boolean {
    if(message !== '验证码'){
        return false;
    }

    const messages = [];
    const code = generateCode(fromId);

    messages.push(`请在网站上输入验证码：${code}`);
    messages.push('');
    messages.push('如需重新生成，请回复\'验证码\'');
    
    BotManager.sendMessageToContact(selfId, fromId, messages.join('\n'));
    return true;
}

export function verifyPairCode(code: string) : string {
    for(const key in pairing){
        const pair : PeerPair = pairing[key];
        if(pair.code === code){
            return pair.id;
        }
    }

    return null;
}

function generateCode(contactId : string) : string {
    const existingPairing : PeerPair = pairing[contactId];
    const now = new Date().getTime();
    const duration = 5 * 60 * 1000;

    process.nextTick(cleanup);

    if(!!existingPairing && existingPairing.expiry < now){
        existingPairing.expiry = now + duration;
        return existingPairing.code;
    }else{
        const pair = {
            id: contactId,
            code: randomCode(),
            expiry: now + duration
        };

        pairing[contactId] = pair;
        return pair.code;
    }
}

function randomCode() : string {
    let str = '';
    
    for(let i=0;i<6;i++){
        str += Math.floor(Math.random() * 10);
    }

    return str;
}

function cleanup(){
    const now = new Date().getTime();

    for(const key in pairing){
        const pair : PeerPair = pairing[key];
        if(pair.expiry < now){
            delete pairing[key];
        }
    }
}





export class PeerPair {
    id: string;
    code: string;
    expiry: number;
}

export class Peer {
    id: string;
    name: string;
    weixin: string;
}