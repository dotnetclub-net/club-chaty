import { Request, Response } from "express";


export let bind = (req: Request, res: Response) => {
  res.end();
};
