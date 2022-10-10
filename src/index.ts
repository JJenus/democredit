import * as express from "express";
import users from "./controllers/users.controller";

const app = express();
app.use(express.json());

app.use("/users", users);

const port = 4000;

app.listen(port, () => {
  console.log(`I am all hears at ${port}`);
});
