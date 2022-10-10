import { Router, Request, Response } from "express";
import knex from "../database/connection";

const users = Router();
const userRepo = knex("users");

users.get("/", (req: Request, res: Response) => {
  userRepo
    .select(["id", "name", "email"])
    .then((users: any) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: false,
        message: err.message,
      });
    });
});

users.get("/:id", (req: Request, res: Response) => {
    const id = req.params.id
    console.log(id)
  userRepo
    .select(["id", "name", "email"])
    .where("id", id)
    .then((users: any) => {
      res.json(users[0]);
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: false,
        message: err.message,
      });
    });
});

export default users;
