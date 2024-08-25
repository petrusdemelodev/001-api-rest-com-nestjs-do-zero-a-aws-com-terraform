import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@root/repository/users.repository';
import { JWT_SECRET } from '@root/shared/constants';
import { TokenPayload } from '@root/shared/types';
import { compare } from 'bcrypt';

interface Credentials {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async login(credentials: Credentials): Promise<string> {
    const { email, password } = credentials;

    const user = await this.userRepository.getUserByEmail(email);
    const passwordMatch = await compare(password, user?.password ?? '');

    if (!user || !passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      iat: Math.floor(Date.now() / 1000),
      aud: 'PetrusDeMeloDEV - Se inscreva no canal e ative o sininho',
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: JWT_SECRET,
    });

    return token;
  }
}
