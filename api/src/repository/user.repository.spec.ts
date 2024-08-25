import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { marshall } from '@aws-sdk/util-dynamodb';
import { UsersRepository } from './users.repository';
import { User } from '@root/domain/user.domain';

describe('UserRepository', () => {
  let repository: UsersRepository;
  const dynamoDBClient = new DynamoDBClient({});
  const dynamodbClientMock = mockClient(dynamoDBClient);

  beforeAll(() => {
    repository = new UsersRepository(dynamoDBClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dynamodbClientMock.reset();
  });

  describe('create', () => {
    it('should create a user', async () => {
      // given
      const user = new User({
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        password: '123456',
      });

      // when
      await repository.createUser(user);

      // then
      expect(dynamodbClientMock).toHaveReceivedCommandWith(PutItemCommand, {
        TableName: `dev-users`,
        Item: marshall({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }),
      });
    });
  });

  describe('getByID', () => {
    it('should get a user by ID if user exists', async () => {
      // given
      const id = '27190ff5-e5bb-4800-b23a-191b34670904';

      dynamodbClientMock.on(GetItemCommand).resolves({
        Item: marshall({
          id,
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          password: '123456',
          createdAt: new Date('2024-06-01').toISOString(),
          updatedAt: new Date('2024-06-01').toISOString(),
        }),
      });

      // when
      const user = await repository.getUserByID(id);

      // then
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(id);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@gmail.com');
      expect(user.password).toBe('123456');
      expect(user.createdAt).toEqual(new Date('2024-06-01'));
      expect(user.updatedAt).toEqual(new Date('2024-06-01'));
      expect(dynamodbClientMock).toHaveReceivedCommandWith(GetItemCommand, {
        TableName: `dev-users`,
        Key: marshall({ id }),
      });
    });

    it('should return undefined if user does not exist', async () => {
      // given
      const id = '27190ff5-e5bb-4800-b23a-191b34670904';

      dynamodbClientMock.on(GetItemCommand).resolves({
        Item: null,
      });

      // when
      const user = await repository.getUserByID(id);

      // then
      expect(user).toBeUndefined();
    });
  });

  describe('getByEmail', () => {
    it('should get a user by email if user exists', async () => {
      // given
      const email = 'john.doe@gmail.com';

      dynamodbClientMock.on(QueryCommand).resolves({
        Items: [
          marshall({
            id: '27190ff5-e5bb-4800-b23a-191b34670904',
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            password: '123456',
            createdAt: new Date('2024-06-01').toISOString(),
            updatedAt: new Date('2024-06-01').toISOString(),
          }),
        ],
      });

      // when
      const user = await repository.getUserByEmail(email);

      // then
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe('27190ff5-e5bb-4800-b23a-191b34670904');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@gmail.com');
      expect(user.password).toBe('123456');
      expect(user.createdAt).toEqual(new Date('2024-06-01'));
      expect(user.updatedAt).toEqual(new Date('2024-06-01'));
      expect(dynamodbClientMock).toHaveReceivedCommandWith(QueryCommand, {
        TableName: `dev-users`,
        IndexName: 'email_index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': { S: email },
        },
      });
    });

    it('should return undefined when email does not exist in any user', async () => {
      // given
      const email = 'john.doe@gmail.com';

      dynamodbClientMock.on(QueryCommand).resolves({
        Items: [],
      });

      // when
      const user = await repository.getUserByEmail(email);

      // then
      expect(user).toBeUndefined();
      expect(dynamodbClientMock).toHaveReceivedCommandWith(QueryCommand, {
        TableName: `dev-users`,
        IndexName: 'email_index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': { S: email },
        },
      });
    });
  });
});
