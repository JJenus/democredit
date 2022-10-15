import * as express from "express";
import users from "./routes/users.route";
import auth from "./routes/auth.route";
import { authorization } from "./middlewares/requestAuthorization";
import wallets from "./routes/wallets.route";

const app = express();
app.use(express.json());

app.use("/users", authorization.authorizeRequest, users);

app.use("/wallets", authorization.authorizeRequest, wallets);

app.use("/", auth)

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`>>> Demo Credit is live at port: ${port}`);
});
