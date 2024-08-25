import { NotFoundException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from '@root/repository/users.repository';
import { User } from '@root/domain/user.domain';

describe('UserService', () => {
  let service: UsersService;
  let userRepository: UsersRepository;
  const createUser: jest.Mock = jest.fn();
  const getUserByEmail: jest.Mock = jest.fn();
  const getUserByID: jest.Mock = jest.fn();

  beforeAll(() => {
    userRepository = {
      createUser,
      getUserByEmail,
      getUserByID,
    } as any as UsersRepository;
    service = new UsersService(userRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      // given
      const params = {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      };

      // when
      await service.createUser(params);

      // then
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: params.name,
          email: params.email,
          password: expect.any(String),
        }),
      );
      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(createUser.mock.calls[0][0]).toBeInstanceOf(User);
      expect(
        compare(params.password, createUser.mock.calls[0][0].password),
      ).resolves.toBeTruthy();
    });
  });

  describe('getUserByID', () => {
    it('should return a set of data from user', async () => {
      // given
      const user = new User({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: 'password',
      });
      getUserByID.mockResolvedValue(user);

      // when
      const result = await service.getUserByID(user.id);

      // then
      expect(userRepository.getUserByID).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserByID).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should throw an exception if user does not exist', async () => {
      // given
      getUserByID.mockResolvedValue(undefined);

      // then
      await expect(service.getUserByID('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
