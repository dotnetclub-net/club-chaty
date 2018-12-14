import { Request, Response } from "express";


export let listByUid = (req: Request, res: Response) => {
  res.render("home", {
    title: "Home"
  });
};

export let detail = (req: Request, res: Response) => {
  res.render("home", {
    title: "Home"
  });
};

