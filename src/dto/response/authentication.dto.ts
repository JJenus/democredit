import { UserDTO } from "./user.dto";

export interface AuthencationDTO{
    token: string;
    refreshToken: string;
    user: UserDTO;
}