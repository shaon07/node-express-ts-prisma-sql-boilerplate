import { inject, injectable } from "inversify";
import { TYPES } from "../../../config/types";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../../errors/NotFoundError";
import { handleZodError } from "../../../utils/error";
import { UserIdDto, userIdSchema } from "../../schemas/UserSchema";

@injectable()
export class DeleteUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(id: UserIdDto): Promise<void> {
    try {
      const parsedId = userIdSchema.parse(id);
      const user = await this.userRepository.findById(parsedId);
      if (!user) {
        throw new NotFoundError(`User with ID ${parsedId} not found`);
      }
      await this.userRepository.delete(parsedId);
    } catch (error) {
      handleZodError(error);
      throw error;
    }
  }
}
