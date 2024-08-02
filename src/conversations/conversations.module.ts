import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './conversation.entity';
import { OpenAiModule } from '../openai/openai.module';
import { FileStorageModule } from 'src/common/file-storage.module';
import { ConversationsScheduler } from 'src/conversations/conversation.scheduler';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    OpenAiModule,
    FileStorageModule,
    UsersModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsScheduler],
})
export class ConversationsModule {}