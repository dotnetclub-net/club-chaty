import { Request, Response } from "express";


export let pageHome = (req: Request, res: Response) => {
  res.render("home/index");
};