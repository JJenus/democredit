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
    const expiresIn = moment().add(10, "days").toDate();

    const refreshToken = {
      id: id,
      user_id: userId,
      jwt_id: jwtId,
      expires_in: expiresIn,
    };

    knex("refresh_tokens").insert(refreshToken).then();

    return id;
  }

  public static isTokenValid(token: string, ignoreExpr: boolean = false) {
    jwt.verify(token, this.SECRETE, { ignoreEpiration: ignoreExpr });
  }

  public static getUser(token: string) {
    const decodedToken = jwt.decode(token);
    const user: UserDTO = {
      id: decodedToken.id,
      name: decodedToken.name,
      email: decodedToken.email,
    };
    return user;
  }

  public static getJwtId(token: string) {
    const decodedToken = jwt.decode(token);
    return decodedToken.jti;
  }

  public static async isRefreshTokenValid(
    refreshTokenId: string,
    jwtId: string
  ) {
    const refToken = await knex("refresh_tokens")
      .where("id", refreshTokenId)
      .then((tokens) => {
        return tokens[0];
      })
      .catch((err) => null);
    if (refToken && refToken["jwt_id"] == jwtId) {
      if (moment().isAfter(refToken["expires_in"])) {
        throw new Error("refresh token is expired");
      }
    } else {
      throw new Error("token doesn't exist");
    }

    await knex("refresh_tokens")
      .update({
        used: true,
      })
      .where("id", refreshTokenId)
      .then();
  }
}
