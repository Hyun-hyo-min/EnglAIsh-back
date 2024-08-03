import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { NlpModule } from 'src/nlp/nlp.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/conversations/conversation.entity';

@Module({
  imports: [
    NlpModule,
    UsersModule,
    TypeOrmModule.forFeature([Conversation]), 
  ],
  exports: [ProgressService],
  providers: [ProgressService]
})
export class ProgressModule {}
