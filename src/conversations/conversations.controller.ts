import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationsService } from './conversations.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { promises as fs } from 'fs';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
    constructor(
        private readonly conversationsService: ConversationsService,
    ) { }

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
    @UseInterceptors(FileInterceptor('audio', {
        storage: diskStorage({
            destination: './temp',
            filename: (req, file, callback) => {
                callback(null, extname(file.originalname));
            }
        })
    }))
    async voiceConversation(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        if (!file) {
            throw new BadRequestException('No audio file uploaded');
        }

        try {
            const result = await this.conversationsService.processVoiceConversation(file.path, user);
            await this.deleteFile(file.path);

            return result;
        }

        catch (error) {
            await this.deleteFile(file.path);
            throw error;
        }
    }

    private async deleteFile(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath);
            console.log(`Successfully deleted temporary file: ${filePath}`);
        }

        catch (error) {
            console.error(`Error deleting temporary file ${filePath}:`, error);
        }
    }
}