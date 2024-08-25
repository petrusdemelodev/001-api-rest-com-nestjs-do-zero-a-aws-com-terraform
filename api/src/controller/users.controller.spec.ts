import { UsersService } from '@root/service/users.service';
import { CreateUserRequestDTO } from './dto/create-user-request.dto';
import { UsersController } from './users.controller';
import { User } from '@root/domain/user.domain';
import { AuthenticatedRequest } from '@root/shared/types';

describe('UsersController', () => {
  let usersController: UsersController;

  const createUser: jest.Mock = jest.fn();
  const getUserByID: jest.Mock = jest.fn();
  const userServiceMock = {
    createUser,
    getUserByID,
  } as any;

  beforeAll(() => {
    usersController = new UsersController(userServiceMock as UsersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create an user', async () => {
      // given
      const body = new CreateUserRequestDTO({
        email: 'john.doe@gmail.com',
        name: 'John Doe',
        password: 'password',
      });
      createUser.mockReturnValue('random-user-id');

      // when
      const createUserResponse = await usersController.createUser(body);

      // then
      expect(createUser).toHaveBeenCalledTimes(1);
      expect(createUser).toHaveBeenCalledWith({
        email: body.email,
        name: body.name,
        password: body.password,
      });
      expect(createUserResponse).toEqual({ id: 'random-user-id' });
    });
  });

  describe('getUser', () => {
    it('should get an user by ID', async () => {
      // given
      const user = new User({
        id: 'random-user-id',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: '123456',
      });

      getUserByID.mockReturnValue(user);

      // when
      const getUserResponse = await usersController.getUserByID(user.id);

      // then
      expect(getUserByID).toHaveBeenCalledWith(user.id);
      expect(getUserResponse).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });

  describe('getMe', () => {
    it('should return a user from the authenticated request', async () => {
      // given
      const user = new User({
        id: 'random-user-id',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: '123456',
      });

      getUserByID.mockReturnValue(user);

      // when
      const getUserResponse = await usersController.getMe({
        userID: user.id,
      } as any as AuthenticatedRequest);

      // then
      expect(getUserByID).toHaveBeenCalledWith(user.id);
      expect(getUserResponse).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });
  });
});
