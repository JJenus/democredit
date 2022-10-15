import { NextFunction, Request, Response } from "express";
import { usersRepository } from "../repository/user.repository";
import { JWT } from "../security/jwt";

export const authorization = {
  authorizeRequest: async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res
        .status(401)
        .send({ message: "Authorization headers not found" });
    }

    try {
      const token = authToken.split(" ")[1];
      JWT.isTokenValid(token);
      const user = JWT.getUser(token);

      if (!(await usersRepository.findByEmail(user.email))) {
        throw new Error("invalid user authentication credentials");
      }

      req.body.userId = user.id;
    } catch (error) {
      return res.status(401).send({
        message: error.message,
      });
    }

    next();
  },
};
