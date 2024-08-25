import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { UsersService } from './service/users.service';
import { UsersRepository } from './repository/users.repository';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './shared/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const { LOCAL_DEVELOPMENT = false, AWS_REGION = 'us-east-1' } = process.env;

const client = new DynamoDBClient({
  region: LOCAL_DEVELOPMENT ? undefined : AWS_REGION,
  endpoint: LOCAL_DEVELOPMENT ? 'http://localhost:8000' : undefined,
});

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: DynamoDBClient,
      useValue: client,
    },
  ],
})
export class AppModule {}
