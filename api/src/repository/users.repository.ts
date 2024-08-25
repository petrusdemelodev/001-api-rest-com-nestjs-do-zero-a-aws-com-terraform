import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable } from '@nestjs/common';
import { User } from '@root/domain/user.domain';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const {
  LOCAL_DEVELOPMENT = false,
  AWS_REGION = 'us-east-1',
  ENVIRONMENT = 'dev',
} = process.env;

const client = new DynamoDBClient({
  region: LOCAL_DEVELOPMENT ? undefined : AWS_REGION,
  endpoint: LOCAL_DEVELOPMENT ? 'http://localhost:8000' : undefined,
});

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersRepository {
  public async createUser(user: User): Promise<void> {
    const command = new PutItemCommand({
      TableName: `${ENVIRONMENT}-users`,
      Item: marshall({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }),
      ConditionExpression: 'attribute_not_exists(id)',
    });

    await client.send(command);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const command = new QueryCommand({
      TableName: `${ENVIRONMENT}-users`,
      IndexName: 'email_index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: marshall({ ':email': email }),
    });

    const response = await client.send(command);

    if (response.Items?.length === 0) {
      return undefined;
    }

    const userRecord = unmarshall(response.Items[0]) as UserRecord;
    return this.mapUserFromUserRecord(userRecord);
  }

  public async getUserByID(userID: string): Promise<User | undefined> {
    const command = new GetItemCommand({
      TableName: `${ENVIRONMENT}-users`,
      Key: marshall({ id: userID }),
    });

    const response = await client.send(command);

    if (!response.Item) {
      return undefined;
    }

    const userRecord = unmarshall(response.Item) as UserRecord;
    return this.mapUserFromUserRecord(userRecord);
  }

  private mapUserFromUserRecord(record: UserRecord): User {
    return new User({
      id: record.id,
      email: record.email,
      password: record.password,
      name: record.name,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    });
  }
}