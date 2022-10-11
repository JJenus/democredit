import * as express from "express";
import knex from "./database/connection";
import userController from "./controllers/users.controller";
import * as Joi from "joi";
import { Password } from "./security/password.security";
import { UserDTO } from "./dto/response/user.dto";
import { AuthencationDTO } from "./dto/response/authentication.dto";
import { JWT } from "./security/jwt";
import { RegisterDTO } from "./dto/request/register.dto";
import { LoginDTO } from "./dto/request/login.dto";
import { RefreshTokenDTO } from "./dto/request/refreshToken.dto";

const app = express();
app.use(express.json());

app.use("/users", userController);

app.post("/register", async (req: express.Request, res: express.Response) => {
  const body: RegisterDTO = req.body;

  try {
    await validate(body, "registration");
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  const existingUser = await findUserByEmail(body.email);
  console.log(existingUser);
  if (existingUser) {
    return res.status(400).json({
      message: "email already exists",
    });
  }

  const passwordHash = await Password.hash(body.password);

  const user: RegisterDTO = {
    name: body.name,
    email: body.email,
    password: passwordHash,
  };

  knex("users")
    .insert(user)
    .then((id) => {
      const userDTO: UserDTO = {
        id: id[0],
        email: user.email,
        name: user.name,
      };

      const authentication: AuthencationDTO = {
        token: JWT.generateToken(userDTO),
        refreshToken: JWT.generateRefreshToken(userDTO.id),
        user: userDTO,
      };

      return res.status(201).send(authentication);
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message,
      });
    });
});

app.post("/login", async (req: express.Request, res: express.Response) => {
  const body: LoginDTO = req.body;

  try {
    await validate(body, "login");
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  const user = await findUserByEmail(body.email);

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
});

app.post(
  "/token/refresh",
  async (req: express.Request, res: express.Response) => {
    const body: RefreshTokenDTO = req.body;

    try {
      //check if token is valid: throws error if not valid
      JWT.isTokenValid(body.token);
      //check if token is valid: throws error if not valid
      await JWT.isRefreshTokenValid(
        body.refreshToken,
        JWT.getJwtId(body.token)
      );
    } catch (error) {
      return res.status(401).send({
        message: error.message,
      });
    }

    const userDTO: UserDTO = JWT.getUser(body.token);
    
    const authentication: AuthencationDTO = {
      token: JWT.generateToken(userDTO),
      refreshToken: JWT.generateRefreshToken(userDTO.id),
      user: userDTO,
    };
  
    return res.status(200).send(authentication);
  }
);

async function findUserByEmail(email: string) {
  const user = await knex("users")
    .where("email", email)
    .then((users) => {
      return users[0];
    });

  return user;
}

async function validate(body: object, form: string = "login") {
  let schema: Joi.ObjectSchema;
  if (form == "login") {
    schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
  } else {
    schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email({ minDomainSegments: 2 }).required(),
      password: Joi.string().required().min(3),
    });
  }

  return await schema.validateAsync(body);
}

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`>>> Demo Credit is live at port: ${port}`);
});
