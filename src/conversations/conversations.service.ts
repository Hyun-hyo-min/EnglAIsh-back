import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private openAiService: OpenAiService
  ) {}

  async createConversation(createConversationDto: CreateConversationDto, user: User): Promise<Conversation> {
    const { title, language, initialMessage } = createConversationDto;

    const conversation = new Conversation();
    conversation.title = title;
    conversation.language = language;
    conversation.messages = [initialMessage];
    conversation.messageCount = 1;
    conversation.user = user;

    // AI 응답 생성
    const aiResponse = await this.generateAIResponse(initialMessage, language);
    conversation.messages.push(aiResponse);
    conversation.messageCount++;

    return this.conversationsRepository.save(conversation);
  }

  private async generateAIResponse(message: string, language: string): Promise<string> {
    return this.openAiService.generateResponse(message, language);
  }
}