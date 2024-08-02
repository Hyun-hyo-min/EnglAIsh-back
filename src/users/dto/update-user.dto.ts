import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  password?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  providerId?: string;
}