import { AuthService } from '@root/service/auth.service';
import { AuthController } from './auth.controller';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;

  const login: jest.Mock = jest.fn();
  const authServiceMock = {
    login,
  } as any;

  beforeAll(() => {
    authController = new AuthController(authServiceMock as AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      // given
      const email = 'john.doe@gmail.com';
      const password = 'password';
      login.mockReturnValue('access-token');

      // when
      const authResponse = await authController.login({ email, password });

      // then
      expect(login).toHaveBeenCalledTimes(1);
      expect(login).toHaveBeenCalledWith({ email, password });
      expect(authResponse).toEqual({ accessToken: 'access-token' });
    });

    it('should return an exception if we send wrong credentials', async () => {
      // given
      const email = 'john.doe@gmail.com';
      const password = 'wrong-password';
      login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // then
      await expect(authController.login({ email, password })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(login).toHaveBeenCalledTimes(1);
      expect(login).toHaveBeenCalledWith({ email, password });
    });
  });
});
