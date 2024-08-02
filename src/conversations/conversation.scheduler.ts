import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConversationsService } from 'src/conversations/conversations.service';

@Injectable()
export class ConversationsScheduler {
  constructor(private conversationsService: ConversationsService) {}

  @Cron('0 0 * * *')
  async handleDailyReset() {
    await this.conversationsService.resetDailyMessageCount();
  }
}