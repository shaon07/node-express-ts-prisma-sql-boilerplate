import { inject, injectable } from "inversify";
import { TYPES } from "../../config/types";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ValidationError } from "../../errors/ValidationError";
import { handleZodError } from "../../utils/error";
import { CreateUserDto, createUserSchema } from "../schemas/UserSchema";

@injectable()
export class CreateUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: CreateUserDto): Promise<User> {
    try {
      const parsedInput = createUserSchema.parse(input);
      const existingUser = await this.userRepository.findByEmail(
        parsedInput.email
      );
      if (existingUser) {
        throw new ValidationError("Email already in use");
      }
      const user = new User(
        parsedInput.name,
        parsedInput.email,
        parsedInput.password,
        undefined
      );
      return this.userRepository.save(user);
    } catch (error) {
      handleZodError(error);
      throw error;
    }
  }
}
