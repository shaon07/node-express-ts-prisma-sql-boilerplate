import { injectable } from "inversify";
import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { InternalServerError } from "../../errors/InternalServerError";
import prisma from "../database/prisma/client";

@injectable()
export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return new User(user.name, user.email, user.password, user.id);
    } catch (error) {
      throw new InternalServerError("Failed to fetch user by ID");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return new User(user.name, user.email, user.password, user.id);
    } catch (error) {
      throw new InternalServerError("Failed to fetch user by email");
    }
  }

  async save(user: User): Promise<User> {
    try {
      if (user.id) {
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { name: user.name, email: user.email, password: user.password },
        });
        return new User(
          updatedUser.name,
          updatedUser.email,
          updatedUser.password,
          updatedUser.id
        );
      } else {
        const newUser = await prisma.user.create({
          data: { name: user.name, email: user.email, password: user.password },
        });
        return new User(
          newUser.name,
          newUser.email,
          newUser.password,
          newUser.id
        );
      }
    } catch (error) {
      throw new InternalServerError("Failed to save user");
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerError("Failed to delete user");
    }
  }
}
