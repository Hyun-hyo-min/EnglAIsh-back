import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  providerId?: string;
}