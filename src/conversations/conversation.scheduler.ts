import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationsService } from 'src/conversations/conversations.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class ConversationsScheduler implements OnModuleInit {
  private readonly logger = new Logger(ConversationsScheduler.name);

  constructor(
    private conversationsService: ConversationsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  @Cron('0 0 * * *')
  async handleDailyReset() {
    this.logger.log('Starting daily reset of message counts');
    try {
      await this.conversationsService.resetDailyMessageCount();
      const users = await this.usersRepository.find();
      for (const user of users) {
        user.countResetAt = new Date();
        await this.usersRepository.save(user);
      }
      this.logger.log('Daily reset of message counts completed successfully');
    } catch (error) {
      this.logger.error('Error during daily reset of message counts', error.stack);
    }
  }

  async onModuleInit() {
    this.logger.log('Checking if daily reset is needed on module initialization');
    const users = await this.usersRepository.find();
    const now = new Date();
    for (const user of users) {
      const lastReset = user.countResetAt;
      if (lastReset && this.isDifferentDay(lastReset, now)) {
        this.logger.log(`User ${user.id} needs daily reset. Last reset was on ${lastReset}`);
        await this.handleDailyReset();
        break;
      }
    }
    this.logger.log('Module initialization check completed');
  }

  isDifferentDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }
}
