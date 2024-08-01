import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './conversation.entity';
import { OpenAiModule } from '../openai/openai.module';
import { FileStorageModule } from 'src/common/file-storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    OpenAiModule,
    FileStorageModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}