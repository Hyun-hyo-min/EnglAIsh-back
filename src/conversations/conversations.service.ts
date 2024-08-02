import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { OpenAiService } from '../openai/openai.service';
import { FileStorageService } from '../common/file-storage.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private openAiService: OpenAiService,
    private fileStorageService: FileStorageService
  ) { }

  async createConversation(createConversationDto: CreateConversationDto, user: User): Promise<Conversation> {
    const { title, initialMessage } = createConversationDto;

    const conversation = new Conversation();
    conversation.title = title;
    conversation.messages = [initialMessage];
    conversation.messageCount = 1;
    conversation.user = user;

    try {
      // AI 응답 생성
      const aiResponse = await this.openAiService.generateTextResponse(initialMessage);
      conversation.messages.push(aiResponse);
      conversation.messageCount++;

      return await this.conversationsRepository.save(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new InternalServerErrorException('Failed to create conversation');
    }
  }

  async processVoiceConversation(audioFilePath: string, user: User): Promise<{ text: string; audioUrl: string }> {
    if (!audioFilePath) {
      throw new BadRequestException('Audio file path is undefined');
    }

    try {
      const { text, audioUrl } = await this.openAiService.processVoiceConversation(audioFilePath);

      // Conversation 엔티티 생성 및 저장
      const conversation = new Conversation();
      conversation.title = 'Voice Conversation';
      conversation.messages = [text];
      conversation.messageCount = 1;
      conversation.user = user;

      await this.conversationsRepository.save(conversation);

      return { text, audioUrl };
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

}