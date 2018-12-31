import { Request, Response } from "express";
import * as ChatStore from '../../chaty/chat/chat-store';

export let listUids = (req: Request, res: Response) => {
  const uidList = ChatStore.listUid();
  res.json(uidList);
};

export let listChats = (req: Request, res: Response) => {
  const uid: string = req.params.uid;
  const msgList = ChatStore.listChats(uid);
  
  res.json(msgList);
};

export let detail = (req: Request, res: Response) => {
  const uid: string = req.params.uid;
  const chatId: string = req.params.chatid;
  
  const chat = ChatStore.getChatDetail(uid, chatId);
  res.json(chat);
};

export let pageDetail = (req: Request, res: Response) => {
  const uid: string = req.params.uid;
  const chatId: string = req.params.chatid;

  res.render("chat/index", {uid, chatId});
};

export let downloadFile = (req: Request, res: Response) => {
  const fileId: string = req.params.fileid;
  
  const file = ChatStore.retrieveFile(fileId);
  res.set('Content-Type', 'application/octet-stream');
  res.send(file);
};


