import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as fs from 'fs';

require('dotenv').config();

@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async processVoiceConversation(audioFilePath: string): Promise<{ text: string, audioBuffer: Buffer }> {
        if (!audioFilePath) {
            throw new Error('Audio file path is undefined');
        }

        try {
            const transcription = await this.transcribeAudio(audioFilePath);

            const responseText = await this.generateTextResponse(transcription);

            const audioBuffer = await this.synthesizeSpeech(responseText);

            return { text: responseText, audioBuffer };
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Failed to process voice conversation');
        }
    }

    async transcribeAudio(filePath: string): Promise<string> {
        const transcription = await this.openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });
        return transcription.text;
    }

    async generateTextResponse(prompt: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant for English conversation practice. Respond in English." },
                { role: "user", content: prompt }
            ],
            max_tokens: 150
        });

        return completion.choices[0].message.content.trim();
    }

    async synthesizeSpeech(text: string): Promise<Buffer> {
        const mp3 = await this.openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        return buffer;
    }
}