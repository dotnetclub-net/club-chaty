import { Request, Response } from "express";


export let listByUid = (req: Request, res: Response) => {
  let list = [];
  res.json(list);
};

export let detail = (req: Request, res: Response) => {
  let msg = {};
  res.json(msg);
};

