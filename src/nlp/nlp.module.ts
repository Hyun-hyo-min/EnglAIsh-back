import { Module } from '@nestjs/common';
import { NlpService } from './nlp.service';

@Module({
  imports: [],
  exports: [NlpService],
  controllers: [],
  providers: [NlpService],
})
export class NlpModule {}
