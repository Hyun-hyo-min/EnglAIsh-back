import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

require('dotenv').config();

@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateResponse(prompt: string, language: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a helpful assistant for English conversation practice. Respond in ${language}.` },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to generate AI response');
        }
    }
}