import { Request, Response } from "express";
import * as BotManager from "../../chaty/bot/bot-manager"

export let status = (req: Request, res: Response) => {
  const status = BotManager.getStatus();
  res.json(status);
};

export let start = (req: Request, res: Response) => {
  BotManager.start((qrcodeUrl) => {
    if(res.finished){ return; }

    res.json({ qrcodeUrl  });
  });
};

export let stop = (req: Request, res: Response) => {
  BotManager.stop(() => {
    if(res.finished){ return; }
    res.end();
  });
};

