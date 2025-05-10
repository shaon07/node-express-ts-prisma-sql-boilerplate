import { User } from "../../domain/entities/User";

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
}

export function mapToUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id!,
    name: user.name,
    email: user.email,
  };
}
