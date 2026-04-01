import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  getUnread(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUnread(userId);
  }

  @Get(':userId/count')
  getCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markRead(id);
  }

  @Patch(':userId/read-all')
  markAllRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllRead(userId);
  }
}
