import { Request, Response } from "express";


export let status = (req: Request, res: Response) => {
  res.json({
    started: false
  });
};

export let start = (req: Request, res: Response) => {
  res.json({
    started: false
  });
};

export let scan = (req: Request, res: Response) => {
  res.json({
    started: false
  });
};


