import { Module } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { FileStorageModule } from 'src/file-storage/file-storage.module';

@Module({
  imports: [FileStorageModule],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class OpenAiModule { }