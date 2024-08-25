import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDTO {
  @ApiProperty({
    description: 'The id of the created user',
    example: '209c4620-8031-4f05-9c07-dbd095c1d407',
  })
  public id: string;

  constructor(id: string) {
    this.id = id;
  }
}
