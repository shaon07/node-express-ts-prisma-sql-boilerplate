import { inject, injectable } from "inversify";
import { TYPES } from "../../config/types";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../errors/NotFoundError";
import { handleZodError } from "../../utils/error";
import { UpdateUserDto, updateUserSchema } from "../schemas/UserSchema";

@injectable()
export class UpdateUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: UpdateUserDto): Promise<User> {
    try {
      const parsedInput = updateUserSchema.parse(input);
      const user = await this.userRepository.findById(parsedInput.id);
      if (!user) {
        throw new NotFoundError(`User with ID ${parsedInput.id} not found`);
      }
      if (parsedInput.name) user.name = parsedInput.name;
      if (parsedInput.email) user.email = parsedInput.email;
      if (parsedInput.password) user.password = parsedInput.password;
      return this.userRepository.save(user);
    } catch (error) {
      handleZodError(error);
      throw error;
    }
  }
}
