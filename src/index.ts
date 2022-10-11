import * as express from "express";
import authController from "./controllers/auth.controller";
import userController from "./controllers/users.controller";
import { JWT } from "./security/jwt";


const app = express();
app.use(express.json());

app.use("/users", requireLogin, userController);
app.use("/", authController)

function requireLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authToken = req.headers.authorization;
  console.log(authToken)
  if(!authToken){
    return res.status(401).send({message: "Authorization headers not found"})
  }
  const token = authToken.split(" ")[1];
  try {
    //check if token is valid: throws error if not valid
    JWT.isTokenValid(token);
    JWT.validateUser(JWT.getUser(token))
  } catch (error) {
    return res.status(401).send({
      message: error.message,
    });
  }
  next()
}
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`>>> Demo Credit is live at port: ${port}`);
});
