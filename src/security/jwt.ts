import { UserDTO } from "../dto/response/user.dto";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import moment = require("moment");
import knex from "../database/connection";

export class JWT {
  private static SECRETE: string = "$0me7hing n1c3";
  private static UUID: string;

  public static generateToken(user: UserDTO) {
    this.UUID = uuidv4();
    const token = jwt.sign(user, this.SECRETE, {
      expiresIn: "1h",
      jwtid: this.UUID,
      subject: user.id.toString(),
    });

    return token;
  }

  public static generateRefreshToken(
    userId: number,
    jwtId: string = this.UUID
  ) {
    const id: string = uuidv4();

    const refreshToken = {
      id: id,
      user_id: userId,
      jwt_id: jwtId,
      expires_in: moment().add(10, "d").toDate(),
    };

    knex("refresh_tokens").insert(refreshToken);

    return id;
  }
}
