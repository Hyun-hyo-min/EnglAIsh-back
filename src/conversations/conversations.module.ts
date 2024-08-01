import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    OpenAiModule
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}