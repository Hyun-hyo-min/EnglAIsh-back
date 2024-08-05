import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../file-storage/file-storage.service';
import * as fs from 'fs';
import {
  generateTextResponse,
  synthesizeSpeech,
  transcribeAudio,
} from './utils/openai-utils';

@Injectable()
export class OpenAiService {
  constructor(private fileStorageService: FileStorageService) {}

  async processVoiceConversation(
    audioFilePath: string,
  ): Promise<{ userText: string; aiText: string; audioUrl: string }> {
    if (!audioFilePath || !fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }

    try {
      const transcription = await transcribeAudio(audioFilePath);
      const responseText = await generateTextResponse(transcription);
      const audioBuffer = await synthesizeSpeech(responseText);

      // S3에 오디오 파일 저장
      const audioUrl = await this.fileStorageService.saveFile(
        audioBuffer,
        'response.mp3',
      );

      return { userText: transcription, aiText: responseText, audioUrl };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process voice conversation');
    }
  }
}
