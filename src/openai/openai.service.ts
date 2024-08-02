import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { FileStorageService } from '../common/file-storage.service';
import * as fs from 'fs';


@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor(private fileStorageService: FileStorageService) {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async processVoiceConversation(audioFilePath: string): Promise<{ text: string, audioUrl: string }> {
        console.log('Received audio file path:', audioFilePath);

        if (!audioFilePath) {
            throw new BadRequestException('Audio file path is undefined');
        }

        if (!fs.existsSync(audioFilePath)) {
            throw new NotFoundException(`Audio file not found at path: ${audioFilePath}`);
        }

        try {
            const transcription = await this.transcribeAudio(audioFilePath);
            const responseText = await this.generateTextResponse(transcription);
            const audioBuffer = await this.synthesizeSpeech(responseText);

            // 오디오 파일 저장
            const filename = `response-${Date.now()}.mp3`;
            await this.fileStorageService.saveFile(audioBuffer, filename);
            const audioUrl = this.fileStorageService.getFileUrl(filename);

            return { text: responseText, audioUrl };
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new InternalServerErrorException('Failed to process voice conversation');
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
            model: "gpt-3.5-turbo",
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

        return Buffer.from(await mp3.arrayBuffer());
    }
}