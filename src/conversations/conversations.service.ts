import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private openAiService: OpenAiService,
  ) { }

  async processVoiceConversation(audioFilePath: string, user: User): Promise<{ userText: string, aiText: string, audioUrl: string }> {
    if (!audioFilePath) {
      throw new BadRequestException('Audio file path is undefined');
    }

    if (user.messageCount >= 3) {
      throw new BadRequestException('Daily message limit exceeded');
    }

    try {
      const { userText, aiText, audioUrl } = await this.openAiService.processVoiceConversation(audioFilePath);

      const conversation = new Conversation();
      conversation.title = 'Voice Conversation';
      conversation.userMessage = userText;
      conversation.aiMessage = aiText;
      conversation.user = user;

      await this.conversationsRepository.save(conversation);

      user.messageCount++;
      await this.userRepository.save(user);

      return { userText, aiText, audioUrl };
    } catch (error) {
      console.error('Error processing voice conversation:', error);
      throw new InternalServerErrorException('Failed to process voice conversation');
    }
  }


  async getConversation(id: string, user: User): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async resetDailyMessageCount() {
    await this.userRepository.update({}, { messageCount: 0 });
  }
}