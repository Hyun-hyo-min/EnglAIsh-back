import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './conversation.entity';
import { OpenAiModule } from '../openai/openai.module';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { ConversationsScheduler } from 'src/conversations/conversation.scheduler';
import { UsersModule } from 'src/users/users.module';
import { ProgressModule } from 'src/progress/progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    OpenAiModule,
    FileStorageModule,
    UsersModule,
    ProgressModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsScheduler],
})
export class ConversationsModule {}
