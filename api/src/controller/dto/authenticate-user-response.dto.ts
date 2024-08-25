import { ApiProperty } from '@nestjs/swagger';

export class AuthenticateUserResponseDTO {
  @ApiProperty({
    name: 'accessToken',
    description: 'JWT access token',
  })
  public accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
