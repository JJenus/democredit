import { Request, Response } from "express";
import { LoginDTO } from "../dto/request/login.dto";
import { RefreshTokenDTO } from "../dto/request/refreshToken.dto";
import { RegisterDTO } from "../dto/request/register.dto";
import { AuthencationDTO } from "../dto/response/authentication.dto";
import { UserDTO } from "../dto/response/user.dto";
import { usersRepository } from "../repository/user.repository";
import { walletRepository } from "../repository/wallet.repository";
import { JWT } from "../security/jwt";
import { Password } from "../security/password.security";

export const authController = {
  login: async function (req: Request, res: Response) {
    const body: LoginDTO = req.body;
    const user = await usersRepository.findByEmail(body.email);

    if (!user) {
      return res.status(400).json({
        message: "email doesn't exist",
      });
    }

    if (!(await Password.isPasswordValid(body.password, user.password))) {
      return res.status(400).send({ message: "invalid password" });
    }

    const userDTO: UserDTO = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const authentication: AuthencationDTO = {
      token: JWT.generateToken(userDTO),
      refreshToken: JWT.generateRefreshToken(userDTO.id),
      user: userDTO,
    };

    return res.status(200).send(authentication);
  },

  register: async function (req: Request, res: Response) {
    const body: RegisterDTO = req.body;
    const existingUser = await usersRepository.findByEmail(body.email);

    if (existingUser) {
      return res.status(409).json({
        message: "email already exists",
      });
    }

    const passwordHash = await Password.hash(body.password);

    const user: UserDTO = await usersRepository.save(
      body.name,
      body.email,
      passwordHash
    );

    if (!user) {
      return res.status(500).json({
        message: "error occurred",
      });
    }

    // create wallet for new user
    walletRepository.save(user.id);

    const authentication: AuthencationDTO = {
      token: JWT.generateToken(user),
      refreshToken: JWT.generateRefreshToken(user.id),
      user: user,
    };

    return res.status(201).send(authentication);
  },

  refreshToken: async function (req: Request, res: Response) {
    const body: RefreshTokenDTO = req.body;

    try {
      JWT.isTokenValid(body.token, true);
      await JWT.isRefreshTokenValid(
        body.refreshToken,
        JWT.getJwtId(body.token)
      );
    } catch (error) {
      if (error.message !== "jwt expired") {
        return res.status(401).send({
          message: error.message,
        });
      }
    }

    const user: UserDTO = JWT.getUser(body.token);

    const authentication: AuthencationDTO = {
      token: JWT.generateToken(user),
      refreshToken: JWT.generateRefreshToken(user.id),
      user: user,
    };

    return res.status(200).send(authentication);
  },
};
