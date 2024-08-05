import * as fs from 'fs';
import { OpenAI } from 'openai';
import { openAIConversationPrompt } from './openai-sysytem.prompt';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(filePath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
  });
  return transcription.text;
}

export async function generateTextResponse(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [openAIConversationPrompt, { role: 'user', content: prompt }],
    max_tokens: 150,
  });

  return completion.choices[0].message.content.trim();
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });

  return Buffer.from(await mp3.arrayBuffer());
}
