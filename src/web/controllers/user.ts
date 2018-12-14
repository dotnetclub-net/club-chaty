import { Request, Response } from "express";


export let bind = (req: Request, res: Response) => {
  res.render("home", {
    title: "Home"
  });
};
