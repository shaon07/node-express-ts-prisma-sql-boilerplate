DDD TypeScript Prisma MySQL RESTful API
This project is a Domain-Driven Design (DDD) TypeScript RESTful API for user CRUD operations (Create, Read, Update, Delete) and authentication (Login). It uses Prisma for MySQL, InversifyJS for dependency injection, Zod for input validation with Data Transfer Objects (DTOs), jsonwebtoken for JWT-based authentication, and Express for routing. The error handling system follows best practices from Toptal, Rowsan Ali, and Sematext. Success responses are streamlined with a utility function, and sensitive data (e.g., passwords) is excluded from API responses.
Features

DDD Architecture: Organized into Domain, Application, Infrastructure, and Interface layers.
Enhanced Error Handling: Custom error classes, centralized middleware, and a reusable Zod error handler.
Input Validation: Zod schemas for type-safe DTOs.
Dependency Injection: InversifyJS for scalable dependency management.
Secure Responses: UserResponseDto excludes sensitive fields (e.g., password).
JWT Authentication: Tokens returned for createUser and login endpoints.
Production-Ready: Includes Winston logging, async error handling, and security recommendations.

Folder Structure
src/
├── config/
│ ├── di-container.ts
│ └── types.ts
├── domain/
│ ├── entities/
│ │ └── User.ts
│ └── repositories/
│ └── IUserRepository.ts
├── application/
│ ├── dtos/
│ │ └── UserResponseDto.ts
│ ├── schemas/
│ │ └── UserSchema.ts
│ └── use-cases/
│ ├── CreateUser.ts
│ ├── GetUser.ts
│ ├── UpdateUser.ts
│ ├── DeleteUser.ts
│ └── LoginUser.ts
├── infrastructure/
│ ├── database/
│ │ └── prisma/
│ │ ├── schema.prisma
│ │ └── client.ts
│ └── repositories/
│ └── PrismaUserRepository.ts
├── interface/
│ ├── controllers/
│ │ └── UserController.ts
│ ├── middlewares/
│ │ └── errorHandler.ts
│ └── routes/
│ └── user.routes.ts
├── errors/
│ ├── AppError.ts
│ ├── ValidationError.ts
│ ├── NotFoundError.ts
│ ├── UnauthorizedError.ts
│ └── InternalServerError.ts
├── utils/
│ ├── error.ts
│ ├── logger.ts
│ └── response.ts
└── index.ts

Code Implementation

1. config/types.ts
   Defines symbols for InversifyJS dependency injection.
   export const TYPES = {
   UserRepository: Symbol.for('UserRepository'),
   CreateUserUseCase: Symbol.for('CreateUserUseCase'),
   GetUserUseCase: Symbol.for('GetUserUseCase'),
   UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
   DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
   LoginUserUseCase: Symbol.for('LoginUserUseCase'),
   UserController: Symbol.for('UserController'),
   };

2. config/di-container.ts
   Configures the InversifyJS container.
   import { Container } from 'inversify';
   import { TYPES } from './types';
   import { IUserRepository } from '../domain/repositories/IUserRepository';
   import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';
   import { CreateUser } from '../application/use-cases/CreateUser';
   import { GetUser } from '../application/use-cases/GetUser';
   import { UpdateUser } from '../application/use-cases/UpdateUser';
   import { DeleteUser } from '../application/use-cases/DeleteUser';
   import { LoginUser } from '../application/use-cases/LoginUser';
   import { UserController } from '../interface/controllers/UserController';

const container = new Container();

container.bind<IUserRepository>(TYPES.UserRepository).to(PrismaUserRepository).inSingletonScope();
container.bind<CreateUser>(TYPES.CreateUserUseCase).to(CreateUser).inSingletonScope();
container.bind<GetUser>(TYPES.GetUserUseCase).to(GetUser).inSingletonScope();
container.bind<UpdateUser>(TYPES.UpdateUserUseCase).to(UpdateUser).inSingletonScope();
container.bind<DeleteUser>(TYPES.DeleteUserUseCase).to(DeleteUser).inSingletonScope();
container.bind<LoginUser>(TYPES.LoginUserUseCase).to(LoginUser).inSingletonScope();
container.bind<UserController>(TYPES.UserController).to(UserController).inSingletonScope();

export { container };

3. domain/entities/User.ts
   Defines the User entity.
   export class User {
   constructor(
   public id?: number,
   public name: string,
   public email: string,
   public password: string
   ) {}
   }

4. domain/repositories/IUserRepository.ts
   Defines the repository interface.
   import { User } from '../entities/User';

export interface IUserRepository {
findById(id: number): Promise<User | null>;
findByEmail(email: string): Promise<User | null>;
save(user: User): Promise<User>;
delete(id: number): Promise<void>;
}

5. infrastructure/database/prisma/schema.prisma
   Configures Prisma for MySQL.
   generator client {
   provider = "prisma-client-js"
   }

datasource db {
provider = "mysql"
url env("DATABASE_URL")
}

model User {
id Int @id @default(autoincrement())
name String
email String @unique
password String
}

6. infrastructure/database/prisma/client.ts
   Exports Prisma Client.
   import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

7. infrastructure/repositories/PrismaUserRepository.ts
   Implements the repository with error handling.
   import { injectable } from 'inversify';
   import prisma from '../database/prisma/client';
   import { User } from '../../domain/entities/User';
   import { IUserRepository } from '../../domain/repositories/IUserRepository';
   import { InternalServerError } from '../../errors/InternalServerError';

@injectable()
export class PrismaUserRepository implements IUserRepository {
async findById(id: number): Promise<User | null> {
try {
const user = await prisma.user.findUnique({ where: { id } });
if (!user) return null;
return new User(user.id, user.name, user.email, user.password);
} catch (error) {
throw new InternalServerError('Failed to fetch user by ID');
}
}

async findByEmail(email: string): Promise<User | null> {
try {
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return null;
return new User(user.id, user.name, user.email, user.password);
} catch (error) {
throw new InternalServerError('Failed to fetch user by email');
}
}

async save(user: User): Promise<User> {
try {
if (user.id) {
const updatedUser = await prisma.user.update({
where: { id: user.id },
data: { name: user.name, email: user.email, password: user.password },
});
return new User(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.password);
} else {
const newUser = await prisma.user.create({
data: { name: user.name, email: user.email, password: user.password },
});
return new User(newUser.id, newUser.name, newUser.email, newUser.password);
}
} catch (error) {
throw new InternalServerError('Failed to save user');
}
}

async delete(id: number): Promise<void> {
try {
await prisma.user.delete({ where: { id } });
} catch (error) {
throw new InternalServerError('Failed to delete user');
}
}
}

8. errors/AppError.ts
   Base error class.
   export class AppError extends Error {
   public readonly statusCode: number;
   public readonly isOperational: boolean;

constructor(message: string, statusCode: number) {
super(message);
this.statusCode = statusCode;
this.isOperational = true;
Error.captureStackTrace(this, this.constructor);
}
}

9. errors/ValidationError.ts
   Handles validation errors.
   import { AppError } from './AppError';

export class ValidationError extends AppError {
constructor(message: string) {
super(message, 400);
}
}

10. errors/NotFoundError.ts
    Handles not found errors.
    import { AppError } from './AppError';

export class NotFoundError extends AppError {
constructor(message: string) {
super(message, 404);
}
}

11. errors/UnauthorizedError.ts
    Handles unauthorized errors.
    import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
constructor(message: string) {
super(message, 401);
}
}

12. errors/InternalServerError.ts
    Handles server errors.
    import { AppError } from './AppError';

export class InternalServerError extends AppError {
constructor(message: string) {
super(message, 500);
}
}

13. application/dtos/UserResponseDto.ts
    Defines a DTO for secure user responses, excluding sensitive fields.
    import { User } from '../../domain/entities/User';

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

14. application/schemas/UserSchema.ts
    Defines Zod schemas and DTOs.
    import { z } from 'zod';

export const createUserSchema = z.object({
name: z.string().min(1, 'Name is required'),
email: z.string().email('Invalid email address'),
password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserSchema = z.object({
id: z.number().int().positive('ID must be a positive integer'),
name: z.string().min(1, 'Name is required').optional(),
email: z.string().email('Invalid email address').optional(),
password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const userIdSchema = z.number().int().positive('ID must be a positive integer');

export const loginSchema = z.object({
email: z.string().email('Invalid email address'),
password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserIdDto = z.infer<typeof userIdSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

15. application/use-cases/CreateUser.ts
    Creates a user with centralized Zod error handling.
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { createUserSchema, CreateUserDto } from '../schemas/UserSchema';
    import { ValidationError } from '../../errors/ValidationError';
    import { User } from '../../domain/entities/User';
    import { IUserRepository } from '../../domain/repositories/IUserRepository';
    import { handleZodError } from '../../utils/error';

@injectable()
export class CreateUser {
constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

async execute(input: CreateUserDto): Promise<User> {
try {
const parsedInput = createUserSchema.parse(input);
const existingUser = await this.userRepository.findByEmail(parsedInput.email);
if (existingUser) {
throw new ValidationError('Email already in use');
}
const user = new User(undefined, parsedInput.name, parsedInput.email, parsedInput.password);
return this.userRepository.save(user);
} catch (error) {
handleZodError(error);
throw error;
}
}
}

16. application/use-cases/GetUser.ts
    Retrieves a user by ID.
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { userIdSchema, UserIdDto } from '../schemas/UserSchema';
    import { NotFoundError } from '../../errors/NotFoundError';
    import { User } from '../../domain/entities/User';
    import { IUserRepository } from '../../domain/repositories/IUserRepository';
    import { handleZodError } from '../../utils/error';

@injectable()
export class GetUser {
constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

async execute(id: UserIdDto): Promise<User> {
try {
const parsedId = userIdSchema.parse(id);
const user = await this.userRepository.findById(parsedId);
if (!user) {
throw new NotFoundError(`User with ID ${parsedId} not found`);
}
return user;
} catch (error) {
handleZodError(error);
throw error;
}
}
}

17. application/use-cases/UpdateUser.ts
    Updates a user.
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { updateUserSchema, UpdateUserDto } from '../schemas/UserSchema';
    import { NotFoundError } from '../../errors/NotFoundError';
    import { User } from '../../domain/entities/User';
    import { IUserRepository } from '../../domain/repositories/IUserRepository';
    import { handleZodError } from '../../utils/error';

@injectable()
export class UpdateUser {
constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

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

18. application/use-cases/DeleteUser.ts
    Deletes a user.
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { userIdSchema, UserIdDto } from '../schemas/UserSchema';
    import { NotFoundError } from '../../errors/NotFoundError';
    import { IUserRepository } from '../../domain/repositories/IUserRepository';
    import { handleZodError } from '../../utils/error';

@injectable()
export class DeleteUser {
constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

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

19. application/use-cases/LoginUser.ts
    Handles user login and token generation.
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { loginSchema, LoginDto } from '../schemas/UserSchema';
    import { UnauthorizedError } from '../../errors/UnauthorizedError';
    import { User } from '../../domain/entities/User';
    import { IUserRepository } from '../../domain/repositories/IUserRepository';
    import { handleZodError } from '../../utils/error';
    import jwt from 'jsonwebtoken';

@injectable()
export class LoginUser {
constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

async execute(input: LoginDto): Promise<{ user: User; token: string }> {
try {
const parsedInput = loginSchema.parse(input);
const user = await this.userRepository.findByEmail(parsedInput.email);
if (!user || user.password !== parsedInput.password) {
throw new UnauthorizedError('Invalid email or password');
}
const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
expiresIn: '1h',
});
return { user, token };
} catch (error) {
handleZodError(error);
throw error;
}
}
}

20. interface/controllers/UserController.ts
    Handles HTTP requests with secure responses and token support.
    import { Request, Response, NextFunction } from 'express';
    import { injectable, inject } from 'inversify';
    import { TYPES } from '../../config/types';
    import { CreateUser } from '../../application/use-cases/CreateUser';
    import { GetUser } from '../../application/use-cases/GetUser';
    import { UpdateUser } from '../../application/use-cases/UpdateUser';
    import { DeleteUser } from '../../application/use-cases/DeleteUser';
    import { LoginUser } from '../../application/use-cases/LoginUser';
    import { User } from '../../domain/entities/User';
    import { sendSuccessResponse } from '../../utils/response';
    import { UserResponseDto, mapToUserResponseDto } from '../../application/dtos/UserResponseDto';
    import jwt from 'jsonwebtoken';

@injectable()
export class UserController {
constructor(
@inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUser,
@inject(TYPES.GetUserUseCase) private getUserUseCase: GetUser,
@inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUser,
@inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUser,
@inject(TYPES.LoginUserUseCase) private loginUserUseCase: LoginUser
) {}

private formatUserResponse(user: User, acceptHeader: string | undefined): UserResponseDto {
const userDto = mapToUserResponseDto(user);
if (acceptHeader?.includes('application/vnd.simple+json')) {
return { id: userDto.id, name: userDto.name };
}
return userDto;
}

private catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
return (req: Request, res: Response, next: NextFunction) => {
fn(req, res, next).catch(next);
};
}

createUser = this.catchAsync(async (req: Request, res: Response) => {
const user = await this.createUserUseCase.execute(req.body);
const formattedUser = this.formatUserResponse(user, req.get('Accept'));
const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
expiresIn: '1h',
});
sendSuccessResponse(res, 201, formattedUser, 'User created successfully', { token });
});

getUser = this.catchAsync(async (req: Request, res: Response) => {
const user = await this.getUserUseCase.execute(parseInt(req.params.id));
const formattedUser = this.formatUserResponse(user, req.get('Accept'));
sendSuccessResponse(res, 200, formattedUser, 'User retrieved successfully');
});

updateUser = this.catchAsync(async (req: Request, res: Response) => {
const input = { id: parseInt(req.params.id), ...req.body };
const user = await this.updateUserUseCase.execute(input);
const formattedUser = this.formatUserResponse(user, req.get('Accept'));
sendSuccessResponse(res, 200, formattedUser, 'User updated successfully');
});

deleteUser = this.catchAsync(async (req: Request, res: Response) => {
await this.deleteUserUseCase.execute(parseInt(req.params.id));
sendSuccessResponse(res, 204, null, 'User deleted successfully');
});

login = this.catchAsync(async (req: Request, res: Response) => {
const { user, token } = await this.loginUserUseCase.execute(req.body);
const formattedUser = this.formatUserResponse(user, req.get('Accept'));
sendSuccessResponse(res, 200, formattedUser, 'Login successful', { token });
});
}

21. interface/middlewares/errorHandler.ts
    Centralized error handling middleware.
    import { NextFunction, Request, Response } from 'express';
    import { AppError } from '../../errors/AppError';
    import { logger } from '../../utils/logger';

export const errorHandler = (
err: Error,
req: Request,
res: Response,
next: NextFunction
) => {
if (err instanceof AppError) {
logger.info(`Operational error: ${err.message}`);
return res.status(err.statusCode).json({
status: err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error',
message: err.message,
});
}

logger.error('Unexpected error:', err);
return res.status(500).json({
status: 'error',
message: 'An unexpected error occurred',
});
};

22. interface/routes/user.routes.ts
    Defines API routes, including login.
    import { Router } from 'express';
    import { UserController } from '../controllers/UserController';

export function userRoutes(userController: UserController) {
const router = Router();

router.post('/', userController.createUser);
router.post('/login', userController.login);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

return router;
}

23. utils/error.ts
    Centralized Zod error handling utility.
    import { z } from 'zod';
    import { ValidationError } from '../errors/ValidationError';

export function handleZodError(error: unknown): void {
if (error instanceof z.ZodError) {
throw new ValidationError(
`Validation failed: ${error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')}`
);
}
}

24. utils/logger.ts
    Configures Winston logging.
    import winston from 'winston';

const logger = winston.createLogger({
level: 'info',
format: winston.format.combine(
winston.format.timestamp(),
winston.format.json()
),
transports: [
new winston.transports.File({ filename: 'error.log', level: 'error' }),
new winston.transports.File({ filename: 'combined.log' }),
],
});

if (process.env.NODE_ENV !== 'production') {
logger.add(
new winston.transports.Console({
format: winston.format.simple(),
})
);
}

export { logger };

25. utils/response.ts
    Utility for standardized success responses with optional fields.
    import { Response } from 'express';

export function sendSuccessResponse<T>(
res: Response,
statusCode: number,
data: T | null,
message: string,
additionalFields: Record<string, any> = {}
): void {
res.status(statusCode).json({
data,
message,
...additionalFields,
});
}

26. index.ts
    Sets up the Express server.
    import express from 'express';
    import { container } from './config/di-container';
    import { UserController } from './interface/controllers/UserController';
    import { userRoutes } from './interface/routes/user.routes';
    import { errorHandler } from './interface/middlewares/errorHandler';
    import { TYPES } from './config/types';
    import { logger } from './utils/logger';

const app = express();
app.use(express.json());

const userController = container.get<UserController>(TYPES.UserController);
app.use('/users', userRoutes(userController));

app.use(errorHandler);

process.on('uncaughtException', (err: Error) => {
logger.error('Uncaught Exception: Shutting down...', err);
process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
logger.error('Unhandled Rejection: Shutting down...', err);
process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
logger.info(`Server running on port ${PORT}`);
});

Setup Instructions

Initialize the Project:

Create a directory and run:npm init -y

Install dependencies:npm install express prisma @prisma/client mysql2 inversify reflect-metadata zod winston express-rate-limit jsonwebtoken
npm install --save-dev typescript ts-node @types/express @types/node @types/winston @types/jsonwebtoken

Initialize TypeScript:npx tsc --init

Configure Prisma:

Run:npx prisma init

Update .env with your MySQL connection and JWT secret:DATABASE_URL="mysql://user:password@localhost:3306/dbname"
JWT_SECRET="your_jwt_secret_here"

Copy the schema.prisma file to src/infrastructure/database/prisma/.
Generate Prisma Client:npx prisma generate

Organize Code:

Create the folder structure as shown above.
Copy the provided code into the respective files.

Run the Application:

Compile TypeScript:npx tsc

Start the server:node dist/index.js

Or, for development:ts-node src/index.ts

Test the API:

Use Postman or curl to test endpoints:
POST /users: { "name": "John", "email": "john@example.com", "password": "pass123" }
POST /users/login: { "email": "john@example.com", "password": "pass123" }
GET /users/:id
PUT /users/:id: { "name": "Jane" }
DELETE /users/:id

Set Accept header for client-specific responses:
application/json: Full user details (excluding password).
application/vnd.simple+json: Simplified details (id, name).

Error Handling
HTTP Status Codes

Code
Description
Example

200
OK
Successful GET, PUT, or Login

201
Created
Successful POST (createUser)

400
Bad Request
Validation error

401
Unauthorized
Invalid login credentials

404
Not Found
User not found

500
Internal Server
Unexpected server error

Error Response Format
{
"status": "fail",
"message": "Validation failed: name: Name is required, email: Invalid email address"
}

Features

Custom Errors: AppError subclasses (ValidationError, NotFoundError, etc.) for specific error types.
Centralized Handling: errorHandler middleware for consistent JSON responses.
Zod Validation: handleZodError converts ZodError into ValidationError.
Logging: Winston logs errors to files and console (in development).
Async Safety: catchAsync wraps controller methods to catch errors.
Secure Responses: UserResponseDto excludes sensitive fields like password.
JWT Authentication: Tokens issued for createUser and login.

Example API Responses

Endpoint
Method
Request Body
Accept Header
Response

/users
POST
{ "name": "John", "email": "john@example.com", "password": "pass123" }
application/json
{ "data": { "id": 1, "name": "John", "email": "john@example.com" }, "message": "User created successfully", "token": "jwt_token" }

/users/login
POST
{ "email": "john@example.com", "password": "pass123" }
application/json
{ "data": { "id": 1, "name": "John", "email": "john@example.com" }, "message": "Login successful", "token": "jwt_token" }

/users
POST
{ "email": "invalid" }
application/json
{ "status": "fail", "message": "Validation failed: name: Name is required, email: Invalid email address, password: Password must be at least 6 characters" }

/users/1
GET
None
application/vnd.simple+json
{ "data": { "id": 1, "name": "John" }, "message": "User retrieved successfully" }

/users/999
GET
None
application/json
{ "status": "fail", "message": "User with ID 999 not found" }

Additional Notes

Security:
Passwords are stored in plain text for simplicity. Use bcrypt for hashing in production.
Store JWT_SECRET in .env and use a strong, unique value.

Rate Limiting: Implement express-rate-limit to prevent abuse.
Testing: Use Jest for unit and integration tests.
Environment Variables: Store sensitive configurations in .env.
Scalability: The DDD structure and InversifyJS support adding new features or entities easily.
Authentication: The login endpoint is basic. Add middleware to protect routes (e.g., getUser, updateUser) with JWT verification in production.

Contributing
Contributions are welcome! Submit a pull request or open an issue to discuss improvements or bug fixes.
License
This project is licensed under the MIT License.
