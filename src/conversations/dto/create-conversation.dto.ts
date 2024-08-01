import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ description: 'The title of the conversation' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The language of the conversation' })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiProperty({ description: 'The initial message of the conversation' })
  @IsNotEmpty()
  @IsString()
  initialMessage: string;
}