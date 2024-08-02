import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConversationsService } from './conversations.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/user.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    async voiceConversation(@UploadedFile() file: Express.Multer.File, @GetUser() user: User) {
        if (!file) {
            throw new BadRequestException('No audio file uploaded');
        }

        console.log('Uploaded file:', file);

        return this.conversationsService.processVoiceConversation(file.path, user);
    }
}