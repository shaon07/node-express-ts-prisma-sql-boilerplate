import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import {
  UserResponseDto,
  mapToUserResponseDto,
} from "../../application/dtos/UserResponseDto";
import { CreateUser } from "../../application/use-cases/user/CreateUser";
import { DeleteUser } from "../../application/use-cases/user/DeleteUser";
import { GetUser } from "../../application/use-cases/user/GetUser";
import { LoginUser } from "../../application/use-cases/user/LoginUser";
import { UpdateUser } from "../../application/use-cases/user/UpdateUser";
import { TYPES } from "../../config/types";
import { User } from "../../domain/entities/User";
import { sendSuccessResponse } from "../../utils/response";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUser,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUser,
    @inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUser,
    @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUser,
    @inject(TYPES.LoginUserUseCase) private loginUserUseCase: LoginUser
  ) {}

  private formatUserResponse(
    user: User,
    acceptHeader: string | undefined
  ): UserResponseDto {
    const userDto = mapToUserResponseDto(user);
    if (acceptHeader?.includes("application/vnd.simple+json")) {
      return { id: userDto.id, name: userDto.name, email: userDto.email };
    }
    return userDto;
  }

  private catchAsync(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  }

  createUser = this.catchAsync(async (req: Request, res: Response) => {
    const user = await this.createUserUseCase.execute(req.body);
    const formattedUser = this.formatUserResponse(user, req.get("Accept"));
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "1h",
      }
    );
    sendSuccessResponse(res, 201, formattedUser, "User created successfully", {
      token,
    });
  });

  getUser = this.catchAsync(async (req: Request, res: Response) => {
    const user = await this.getUserUseCase.execute(parseInt(req.params.id));
    const formattedUser = this.formatUserResponse(user, req.get("Accept"));
    sendSuccessResponse(res, 200, formattedUser, "User retrieved successfully");
  });

  updateUser = this.catchAsync(async (req: Request, res: Response) => {
    const input = { id: parseInt(req.params.id), ...req.body };
    const user = await this.updateUserUseCase.execute(input);
    const formattedUser = this.formatUserResponse(user, req.get("Accept"));
    sendSuccessResponse(res, 200, formattedUser, "User updated successfully");
  });

  deleteUser = this.catchAsync(async (req: Request, res: Response) => {
    await this.deleteUserUseCase.execute(parseInt(req.params.id));
    sendSuccessResponse(res, 204, null, "User deleted successfully");
  });

  login = this.catchAsync(async (req: Request, res: Response) => {
    const { user, token } = await this.loginUserUseCase.execute(req.body);
    const formattedUser = this.formatUserResponse(user, req.get("Accept"));
    sendSuccessResponse(res, 200, formattedUser, "Login successful", { token });
  });
}
