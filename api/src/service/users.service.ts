import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@root/domain/user.domain';
import { UsersRepository } from '@root/repository/users.repository';
import { hash } from 'bcrypt';

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async createUser(params: CreateUserParams): Promise<string> {
    const userExists: User = await this.usersRepository.getUserByEmail(
      params.email,
    );

    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await hash(params.password, SALT_ROUNDS);

    const user = new User({
      name: params.name,
      email: params.email,
      password: passwordHash,
    });

    await this.usersRepository.createUser(user);
    return user.id;
  }

  public async getUserByID(userID: string): Promise<IUser> {
    const user: User = await this.usersRepository.getUserByID(userID);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
