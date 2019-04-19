import { Request, Response } from "express";
import * as BotManager from "../../chaty/bot/bot-manager"

export let verify = (req: Request, res: Response) => {
  const code = req.body.code;

  const verifiedPeer = BotManager.verifyPair(code);
  res.json(verifiedPeer);
};
