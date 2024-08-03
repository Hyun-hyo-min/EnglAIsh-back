import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ScheduleModule } from '@nestjs/schedule';
import { NlpModule } from './nlp/nlp.module';
import { ProgressModule } from './progress/progress.module';

require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ConversationsModule,
    FileStorageModule,
    NlpModule,
    ProgressModule,
  ],
})
export class AppModule { }