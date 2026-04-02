import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation/:userAId/:userBId')
  getOrCreate(
    @Param('userAId', ParseIntPipe) userAId: number,
    @Param('userBId', ParseIntPipe) userBId: number,
  ) {
    return this.chatService.getOrCreateConversation(userAId, userBId);
  }

  @Get('messages/:conversationId')
  getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('since') since?: string,
  ) {
    return this.chatService.getMessages(conversationId, since ? Number(since) : undefined);
  }

  @Post('messages')
  sendMessage(@Body() body: { conversationId: number; usuarioId: number; content: string }) {
    return this.chatService.sendMessage(Number(body.conversationId), Number(body.usuarioId), body.content);
  }

  @Get('unread/:userId')
  getUnread(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getUnreadCounts(userId);
  }

  @Patch('conversation/:conversationId/read')
  markAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body('userId') userId: number,
  ) {
    return this.chatService.markAsRead(conversationId, Number(userId));
  }
}
