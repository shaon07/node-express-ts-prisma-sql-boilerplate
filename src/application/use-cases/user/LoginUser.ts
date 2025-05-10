import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import { TYPES } from "../../../config/types";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UnauthorizedError } from "../../../errors/UnauthorizedError";
import { handleZodError } from "../../../utils/error";
import { LoginDto, loginSchema } from "../../schemas/UserSchema";

@injectable()
export class LoginUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: LoginDto): Promise<{ user: User; token: string }> {
    try {
      const parsedInput = loginSchema.parse(input);
      const user = await this.userRepository.findByEmail(parsedInput.email);
      if (!user || user.password !== parsedInput.password) {
        throw new UnauthorizedError("Invalid email or password");
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: "1h",
        }
      );
      return { user, token };
    } catch (error) {
      handleZodError(error);
      throw error;
    }
  }
}
