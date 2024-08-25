import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '@root/service/users.service';
import { CreateUserRequestDTO } from './dto/create-user-request.dto';
import { CreateUserResponseDTO } from './dto/create-user-response.dto';
import { GetUserByIDResponseDTO } from './dto/get-user-by-id-response.dto';
import { AuthenticatedRequest } from '@root/shared/types';
import { Public } from '@root/shared/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created',
    type: CreateUserResponseDTO,
  })
  public async createUser(
    @Body() createUserBody: CreateUserRequestDTO,
  ): Promise<CreateUserResponseDTO> {
    const createdUserID = await this.usersService.createUser({
      name: createUserBody.name,
      email: createUserBody.email,
      password: createUserBody.password,
    });

    return new CreateUserResponseDTO(createdUserID);
  }

  @Get(':userID')
  @Public()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: GetUserByIDResponseDTO,
  })
  public async getUserByID(
    @Param('userID') userID: string,
  ): Promise<GetUserByIDResponseDTO> {
    const userResult = await this.usersService.getUserByID(userID);

    return new GetUserByIDResponseDTO({
      id: userResult.id,
      name: userResult.name,
      email: userResult.email,
      createdAt: userResult.createdAt.toISOString(),
      updatedAt: userResult.updatedAt.toISOString(),
    });
  }

  @Get('me')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: GetUserByIDResponseDTO,
  })
  public async getMe(
    @Req() request: AuthenticatedRequest,
  ): Promise<GetUserByIDResponseDTO> {
    return this.getUserByID(request.userID);
  }
}
