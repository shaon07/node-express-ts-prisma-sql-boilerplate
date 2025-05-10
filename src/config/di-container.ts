import { Container } from "inversify";
import { CreateUser } from "../application/use-cases/user/CreateUser";
import { DeleteUser } from "../application/use-cases/user/DeleteUser";
import { GetUser } from "../application/use-cases/user/GetUser";
import { LoginUser } from "../application/use-cases/user/LoginUser";
import { UpdateUser } from "../application/use-cases/user/UpdateUser";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { PrismaUserRepository } from "../infrastructure/repositories/PrismaUserRepository";
import { UserController } from "../interface/controllers/UserController";
import { TYPES } from "./types";

const container = new Container();

container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(PrismaUserRepository)
  .inSingletonScope();
container
  .bind<CreateUser>(TYPES.CreateUserUseCase)
  .to(CreateUser)
  .inSingletonScope();
container.bind<GetUser>(TYPES.GetUserUseCase).to(GetUser).inSingletonScope();
container
  .bind<UpdateUser>(TYPES.UpdateUserUseCase)
  .to(UpdateUser)
  .inSingletonScope();
container
  .bind<DeleteUser>(TYPES.DeleteUserUseCase)
  .to(DeleteUser)
  .inSingletonScope();
container
  .bind<LoginUser>(TYPES.LoginUserUseCase)
  .to(LoginUser)
  .inSingletonScope();
container
  .bind<UserController>(TYPES.UserController)
  .to(UserController)
  .inSingletonScope();

export { container };
