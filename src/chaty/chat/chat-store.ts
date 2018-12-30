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
    const dir = getFileStorageDir(true);

    const fileId = crypto.randomBytes(16).toString("hex");
    const filename = `${fileId}.file`;
    fs.writeFileSync(path.join(dir, filename), content);

    return fileId; 
};

export let retrieveFile = function(fileId: string) : Buffer {
    const dir = getFileStorageDir(true);
    const filePath = path.join(dir, `${fileId}.file`);

    if(!fs.existsSync(filePath)){
        return null;
    }

    return fs.readFileSync(filePath);
};

export let store = function(wechatId: string, messages : ChatMessage[]): string {
    const dir = getStorageDir(wechatId.replace(/@/, ''), true);

    const chatId = new Date().getTime().toString();
    const filename = `${chatId}.json`;
    var jsonContent = JSON.stringify(messages);
    fs.writeFileSync(path.join(dir, filename), jsonContent); 

    return chatId;
};

export let list = function(wechatId: string): ChatMessage[] {
    const dir = getStorageDir(wechatId.replace(/@/, ''), false);
    if(!fs.existsSync(dir)){
        return [];
    }

    const files = fs.readdirSync(dir)
        .filter(dirent => dirent.endsWith('.json'))
        .sort((a, b) => parseInt(getNameWithoutExtension(b))- parseInt(getNameWithoutExtension(a)));

    return files.map(file => fs.readFileSync(path.join(dir, file), 'utf-8'))
                .map(json => JSON.parse(json))
                .map(obj => <ChatMessage>obj);
};

function getNameWithoutExtension(filename: string) : string {
    const name = filename.substr(filename.lastIndexOf('/') + 1);
    const indexOfDot = name.lastIndexOf('.');
    return indexOfDot === -1 ? name : name.substr(0, indexOfDot);
}

