import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationsService } from './conversations.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { deleteFile } from 'src/common/utils/deleteFile';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@ApiBearerAuth()
@ApiTags('conversations')
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
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('audio', {
        storage: diskStorage({
            destination: './temp',
            filename: (req, file, callback) => {
                callback(null, extname(file.originalname));
            }
        })
    }))
    async voiceConversation(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        console.log(user)
        if (!file) {
            throw new BadRequestException('No audio file uploaded');
        }

        try {
            const result = await this.conversationsService.processVoiceConversation(file.path, user);
            await deleteFile(file.path);

            return result;
        }

        catch (error) {
            await deleteFile(file.path);
            throw error;
        }
    }
}