import { Request, Response } from "express";
import * as BotService from "../../chaty/bot"

export let status = (req: Request, res: Response) => {
  const status = BotService.getStatus();
  res.json(status);
};

export let start = (req: Request, res: Response) => {
  BotService.start(function(qrcodeUrl){
    res.json({ qrcodeUrl });
  });
};

export let stop = (req: Request, res: Response) => {
  BotService.stop();
};



