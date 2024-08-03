import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from 'src/conversations/conversation.entity';
import { NlpService } from 'src/nlp/nlp.service';
import { User } from 'src/users/user.entity';
import { ADVANCED_WORDS, GRAMMER_RULES } from './utils/progress.constants';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Conversation)
        private conversationsRepository: Repository<Conversation>,
        private nlpService: NlpService
    ) { }

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
            const { conversationLevel, grammarLevel, vocabularyLevel } = await this.evaluateEnglishLevel(conversation);
            totalConversationLevel += conversationLevel;
            totalGrammarLevel += grammarLevel;
            totalVocabularyLevel += vocabularyLevel;
        }

        user.conversationLevel = Math.round(totalConversationLevel / recentConversations.length);
        user.grammarLevel = Math.round(totalGrammarLevel / recentConversations.length);
        user.vocabularyLevel = Math.round(totalVocabularyLevel / recentConversations.length);
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

        const conversationLevel = this.evaluateConversationLevel(userMessage, aiMessage);
        const grammarLevel = this.evaluateGrammarLevel(userMessage);
        const vocabularyLevel = this.evaluateVocabularyLevel(userMessage);

        return { conversationLevel, grammarLevel, vocabularyLevel };
    }

    evaluateConversationLevel(userMessage: string, aiMessage: string): number {
        const userWords = this.nlpService.tokenize(userMessage);
        const aiWords = this.nlpService.tokenize(aiMessage);

        // 의미의 일치성
        const commonWords = userWords.filter(word => aiWords.includes(word));
        const relevanceScore = commonWords.length / userWords.length;

        // 감정 분석
        const sentimentScore = this.nlpService.analyzeSentiment(userMessage);

        // 응답의 길이
        const lengthScore = Math.min(userWords.length / 20, 1);

        // 점수 계산
        const score = (relevanceScore * 0.4 + sentimentScore * 0.4 + lengthScore * 0.2) * 100;
        return Math.round(score);
    }


    private evaluateGrammarLevel(userMessage: string): number {
        const sentences = this.nlpService.sentenceTokenize(userMessage);
        let totalScore = 0;

        sentences.forEach(sentence => {
            const words = this.nlpService.tokenize(sentence);
            const tags = this.nlpService.posTag(words);

            // 문장 구조 점수
            const structureScore = this.nlpService.analyzeSentenceStructure(tags);

            // 단어 순서 점수
            const orderScore = this.nlpService.analyzeWordOrder(tags);

            // 문법 오류 감점
            const grammarErrors = this.calculateGrammarErrors(tags);
            const errorPenalty = Math.min(grammarErrors * 5, 100);

            totalScore += (structureScore * 0.5 + orderScore * 0.5) * 100 - errorPenalty;
        });

        const averageScore = totalScore / sentences.length;
        return Math.round(averageScore); // 0-100 스케일로 변환
    }

    private calculateGrammarErrors(tags: string[]): number {
        // 기본 문법 오류 수를 저장
        let errorCount = 0;

        const rules = GRAMMER_RULES;

        for (let i = 0; i < tags.length - 1; i++) {
            for (const rule of rules) {
                const pattern = tags.slice(i, i + rule.pattern.length);
                if (JSON.stringify(pattern) === JSON.stringify(rule.pattern)) {
                    errorCount += rule.error;
                }
            }
        }

        return errorCount;
    }

    private evaluateVocabularyLevel(userMessage: string): number {
        const words = this.nlpService.tokenize(userMessage);
        const uniqueWords = new Set(words);
        const vocabularyScore = Math.min(uniqueWords.size / words.length, 1);

        const advancedWords = ADVANCED_WORDS;
        const stemmedAdvancedWords = advancedWords.map(word => this.nlpService.stemmer.stem(word));
        const stemmedUserWords = words.map(word => this.nlpService.stemmer.stem(word));
        const advancedWordCount = stemmedUserWords.filter(word => stemmedAdvancedWords.includes(word)).length;
        const advancedWordScore = Math.min(advancedWordCount / 2, 1);

        const score = (vocabularyScore * 0.6 + advancedWordScore * 0.4) * 100;
        return Math.round(score);
    }


}
