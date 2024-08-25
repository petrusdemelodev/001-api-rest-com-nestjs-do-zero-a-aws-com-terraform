import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@root/repository/users.repository';
import { hash } from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  const jwtServiceMock = { signAsync: jest.fn() };
  const userRepositoryMock = { getUserByEmail: jest.fn() };

  beforeAll(() => {
    authService = new AuthService(
      userRepositoryMock as any as UsersRepository,
      jwtServiceMock as any as JwtService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should create an access token for a correct user credentials', async () => {
      // given
      const { email, password } = {
        email: 'john.doe@gmail.com',
        password: 'password',
      };

      const user = {
        id: 'random-user-id',
        email,
        password: await hash(password, 10),
      };

      userRepositoryMock.getUserByEmail.mockReturnValue(user);
      jwtServiceMock.signAsync.mockReturnValue('access-token');

      // when
      const token = await authService.login({ email, password });

      // then
      expect(userRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getUserByEmail).toHaveBeenCalledWith(email);
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(1);
      expect(token).toEqual('access-token');
    });

    it('should return an exception for wrong credentials', async () => {
      // given
      const { email, password } = {
        email: 'john.doe@gmail.com',
        password: 'password',
      };

      const user = {
        id: 'random-user-id',
        email,
        password: await hash(password, 10),
      };

      userRepositoryMock.getUserByEmail.mockReturnValue(user);

      // when
      const token = authService.login({
        email,
        password: 'wrong-password',
      });

      // then
      expect(userRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.getUserByEmail).toHaveBeenCalledWith(email);
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(0);
      await expect(token).rejects.toThrow(UnauthorizedException);
    });
  });
});
