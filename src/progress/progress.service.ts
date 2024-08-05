import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from 'src/conversations/conversation.entity';
import { NlpService } from 'src/nlp/nlp.service';
import { User } from 'src/users/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private nlpService: NlpService,
  ) {}

  async updateUserEnglishLevel(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const recentConversations = await this.conversationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (recentConversations.length === 0) {
      throw new BadRequestException('No recent conversations found');
    }

    let totalConversationLevel = 0;
    let totalGrammarLevel = 0;
    let totalVocabularyLevel = 0;

    for (const conversation of recentConversations) {
      const { conversationLevel, grammarLevel, vocabularyLevel } =
        await this.evaluateEnglishLevel(conversation);
      totalConversationLevel += isNaN(conversationLevel)
        ? 0
        : conversationLevel;
      totalGrammarLevel += isNaN(grammarLevel) ? 0 : grammarLevel;
      totalVocabularyLevel += isNaN(vocabularyLevel) ? 0 : vocabularyLevel;
    }

    user.conversationLevel = Math.round(
      totalConversationLevel / recentConversations.length,
    );
    user.grammarLevel = Math.round(
      totalGrammarLevel / recentConversations.length,
    );
    user.vocabularyLevel = Math.round(
      totalVocabularyLevel / recentConversations.length,
    );
    user.totalConversations += 1;

    return this.userRepository.save(user);
  }

  async evaluateEnglishLevel(conversation: Conversation): Promise<{
    conversationLevel: number;
    grammarLevel: number;
    vocabularyLevel: number;
  }> {
    const userMessage = conversation.userMessage.toLowerCase();
    const aiMessage = conversation.aiMessage.toLowerCase();

    const conversationLevel = this.evaluateConversationLevel(
      userMessage,
      aiMessage,
    );
    const grammarLevel = this.evaluateGrammarLevel(userMessage);
    const vocabularyLevel = this.evaluateVocabularyLevel(userMessage);

    return {
      conversationLevel: isNaN(conversationLevel) ? 0 : conversationLevel,
      grammarLevel: isNaN(grammarLevel) ? 0 : grammarLevel,
      vocabularyLevel: isNaN(vocabularyLevel) ? 0 : vocabularyLevel,
    };
  }

  evaluateConversationLevel(userMessage: string, aiMessage: string): number {
    const userWords = this.nlpService.tokenize(userMessage);
    const aiWords = this.nlpService.tokenize(aiMessage);
    const commonWords = userWords.filter((word) => aiWords.includes(word));
    const relevanceScore = commonWords.length / userWords.length;

    const sentimentScore = this.nlpService.analyzeSentiment(userMessage);
    const lengthScore = Math.min(userWords.length / 20, 1);

    const score = (relevanceScore + sentimentScore + lengthScore) * 1.67;
    return Math.round(score * 20);
  }

  private evaluateGrammarLevel(userMessage: string): number {
    const sentences = this.nlpService.sentenceTokenize(userMessage);
    let totalScore = 0;

    sentences.forEach((sentence) => {
      const words = this.nlpService.tokenize(sentence);
      const tags = this.nlpService.posTag(words);

      const grammarErrors = this.nlpService.calculateGrammarErrors(tags);
      const structureScore = this.nlpService.analyzeSentenceStructure(tags);
      const grammarLevel = Math.max(
        0,
        100 - grammarErrors * 10 + structureScore * 10,
      );
      totalScore += grammarLevel;
    });

    const averageScore = sentences.length
      ? Math.round(totalScore / sentences.length)
      : 0;
    return averageScore;
  }

  private evaluateVocabularyLevel(userMessage: string): number {
    return this.nlpService.evaluateVocabulary(userMessage);
  }
}
