import * as express from "express";
import { JWT } from "./security/jwt";
import authController from "./controllers/auth.controller";
import userController from "./controllers/users.controller";
import walletController from "./controllers/wallet.controller";

const app = express();
app.use(express.json());

app.use("/users", requireLogin, userController);
app.use("/wallets", requireLogin, walletController);

app.use("/", authController)

async function requireLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authToken = req.headers.authorization;
  if(!authToken){
    return res.status(401).send({message: "Authorization headers not found"})
  }
 
  try {
    const token = authToken.split(" ")[1];
    //check if token is valid: throws error if not valid
    JWT.isTokenValid(token);
    await JWT.validateUser(JWT.getUser(token))
    next()
  } catch (error) {
    return res.status(401).send({
      message: error.message,
    });
  }
}
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`>>> Demo Credit is live at port: ${port}`);
});
