import knex from "../database/connection";
import { UserDTO } from "../dto/response/user.dto";

export const usersRepository = {
  async findByEmail(userEmail: string) {
    //only this is allowed to fetch passwords
    const user = await knex("users")
      .select("*")
      .where("email", userEmail)
      .then((users) => {
        return users[0];
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return user;
  },

  async findById(userId: number): Promise<UserDTO> {
    const user = await knex("users")
      .select(["id", "name", "email"])
      .where("id", userId)
      .then((users) => {
        return users[0];
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return user;
  },

  async findAll(): Promise<UserDTO[]> {
    const users = await knex("users")
      .select(["id", "name", "email"])
      .then((users) => {
        return users;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return users;
  },

  async save(name: string, email: string, password: string): Promise<UserDTO> {
    const user = await knex("users")
      .insert({
        name: name,
        email: email,
        password: password
      })
      .then((id) => {
        const userDTO: UserDTO = {
          id: id[0],
          name: name,
          email: email,
        };

        return userDTO;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });

    return user;
  },
};
