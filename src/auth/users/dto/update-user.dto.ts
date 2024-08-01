import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: false })
  password?: string;

  @ApiProperty({ required: false })
  email?: string;
}