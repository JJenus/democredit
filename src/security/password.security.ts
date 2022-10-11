import * as bcrypt from "bcrypt"

export class Password{
    public static async hash(password: string){
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        return passwordHash;
    }

    public static async isPasswordValid(password: string, passwordHash:string){
        return await bcrypt.compare(password, passwordHash);
    }
}