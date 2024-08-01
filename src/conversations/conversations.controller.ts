import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/users/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationsController {
    constructor(private readonly conversationService: ConversationsService) { }

    @ApiOperation({ summary: 'Create new conversation' })
    @Post()
    async createConversation(
        @Body() createConversationDto: CreateConversationDto,
        @GetUser() user: User
    ) {
        return this.conversationService.createConversation(createConversationDto, user);
    }
}