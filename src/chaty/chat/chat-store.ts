import * as fs from "fs";
import * as path from "path";
import ChatMessage from "./messages/chat-message";
import * as crypto from 'crypto';

const baseStorageDir = path.resolve(__dirname + '../../../../data/messages');
const baseFileStorageDir = path.resolve(__dirname + '../../../../data/files');


function getStorageDir(wechatId: string, createDir: boolean) {
    const dir = path.join(baseStorageDir, wechatId);
    if (createDir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    return dir;
}

function getFileStorageDir(createDir: boolean) {
    const dir = path.join(baseFileStorageDir, '');
    if (createDir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    return dir;
}


export let storeFile = function(content: Buffer) : string {
    const fileBaseDir = getFileStorageDir(true);

    const fileId = crypto.randomBytes(16).toString("hex");
    const filename = `${fileId}.file`;
    fs.writeFileSync(path.join(fileBaseDir, filename), content);

    return fileId; 
};

export let retrieveFile = function(fileId: string) : Buffer {
    const fileBaseDir = getFileStorageDir(true);
    const filePath = path.join(fileBaseDir, `${fileId}.file`);

    if(!fs.existsSync(filePath)){
        return null;
    }

    return fs.readFileSync(filePath);
};

export let store = function(wechatId: string, messages : ChatMessage[]): string {
    const userDir = getStorageDir(wechatId.replace(/@/, ''), true);

    const chatId = new Date().getTime().toString();
    const filename = `${chatId}.json`;
    var jsonContent = JSON.stringify(messages);
    fs.writeFileSync(path.join(userDir, filename), jsonContent); 

    return chatId;
};

export let listUid = function(): string[] {
    const baseDir = getStorageDir('', false);
    if(!fs.existsSync(baseDir)){
        return [];
    }

    return fs.readdirSync(baseDir)
        .filter(name => fs.lstatSync(path.join(baseDir, name)).isDirectory())
        .sort();
};

export let listChats = function(wechatId: string): string[] {
    const userDir = getStorageDir(wechatId.replace(/@/, ''), false);
    if(!fs.existsSync(userDir)){
        return [];
    }

    return fs.readdirSync(userDir)
        .filter(file => file.endsWith('.json'))
        .map(file => getNameWithoutExtension(file))
        .sort((a, b) => parseInt(b)- parseInt(a));
};

export let listChatsWithDetail = function(wechatId: string): string[] {
    const userDir = getStorageDir(wechatId.replace(/@/, ''), false);
    return listChats(wechatId)
        .map(file => fs.readFileSync(path.join(userDir, file), 'utf-8'))
        .map(json => JSON.parse(json));
};

export let getChatDetail = function(wechatId: string, chatId: string): any {
    wechatId = wechatId.replace(/@/, '');
    const userDir = getStorageDir(wechatId, false);
    const chatFile = path.join(userDir, `${chatId}.json`);
    if(!fs.existsSync(chatFile)){
        return null;
    }

    const content = fs.readFileSync(chatFile, 'utf-8');
    return JSON.parse(content);
};

function getNameWithoutExtension(filename: string) : string {
    const name = filename.substr(filename.lastIndexOf('/') + 1);
    const indexOfDot = name.lastIndexOf('.');
    return indexOfDot === -1 ? name : name.substr(0, indexOfDot);
}

