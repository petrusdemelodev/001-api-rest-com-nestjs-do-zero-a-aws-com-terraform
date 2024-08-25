import { ApiProperty } from '@nestjs/swagger';

export class GetUserByIDResponseDTO {
  @ApiProperty({
    name: 'id',
    description: 'id of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  public id: string;

  @ApiProperty({
    name: 'name',
    description: 'name of the user',
    example: 'John Doe',
  })
  public name: string;

  @ApiProperty({
    name: 'email',
    description: 'email of the user',
    example: 'john.doe@gmail.com',
  })
  public email: string;

  @ApiProperty({
    name: 'createdAt',
    description: 'when the user was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  public createdAt: string;

  @ApiProperty({
    name: 'updatedAt',
    description: 'when the user was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  public updatedAt: string;

  constructor(params: GetUserByIDResponseDTO) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
