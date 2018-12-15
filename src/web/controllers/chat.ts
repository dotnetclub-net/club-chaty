import { Request, Response } from "express";
import * as ChatStore from '../../chaty/chat/chat-store';

export let listByUid = (req: Request, res: Response) => {
  const uid: string = req.params.uid;
  const msgList = ChatStore.list(uid);
  
  res.json(msgList);
};

export let detail = (req: Request, res: Response) => {
  let msg = {};
  res.json(msg);
};

export let download = (req: Request, res: Response) => {
  let msg = {};
  res.json(msg);
};

