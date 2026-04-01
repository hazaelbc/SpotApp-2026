import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnread(userId: number) {
    return this.prisma.notification.findMany({
      where: { usuarioId: userId, leido: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { usuarioId: userId, leido: false },
    });
    return { count };
  }

  async markRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { leido: true },
    });
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { usuarioId: userId, leido: false },
      data: { leido: true },
    });
    return { ok: true };
  }
}
