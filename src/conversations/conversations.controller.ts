import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { OpenAiService } from 'src/openai/openai.service';
import { FileStorageService } from 'src/common/file-storage.service';
import { Response } from 'express';
import { Express } from 'express-serve-static-core';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationsController {
    constructor(
        private readonly conversationService: ConversationsService,
        private readonly openAiService: OpenAiService,
        private readonly fileStorageService: FileStorageService,
    ) { }

    @ApiOperation({ summary: 'Create new conversation' })
    @Post()
    async createConversation(
        @Body() createConversationDto: CreateConversationDto,
        @GetUser() user: User
    ) {
        return this.conversationService.createConversation(createConversationDto, user);
    }

    @ApiOperation({ summary: 'Process voice conversation' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Post('voice-conversation')
    @UseInterceptors(FileInterceptor('audio'))
    async voiceConversation(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ) {
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log('Uploaded file:', file);

        let tempFilePath: string;

        try {
            // 임시 파일로 저장
            tempFilePath = join(process.cwd(), 'temp', `${file.originalname}`);
            await writeFile(tempFilePath, file.buffer);

            const result = await this.openAiService.processVoiceConversation(tempFilePath);

            const audioFileName = `response-${Date.now()}.mp3`;
            await this.fileStorageService.saveFile(result.audioBuffer, audioFileName);
            const audioUrl = this.fileStorageService.getFileUrl(audioFileName);

            res.json({
                text: result.text,
                audioUrl: audioUrl
            });
        } catch (error) {
            console.error('Error processing voice conversation:', error);
            res.status(500).json({ message: 'Error processing voice conversation', error: error.message });
        } finally {
            // 임시 파일 삭제
            if (tempFilePath) {
                try {
                    await unlink(tempFilePath);
                    console.log(`Temporary file deleted: ${tempFilePath}`);
                } catch (unlinkError) {
                    console.error('Error deleting temporary file:', unlinkError);
                }
            }
        }
    }
}