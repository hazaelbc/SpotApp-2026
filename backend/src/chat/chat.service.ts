import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca una conversación 1:1 entre dos usuarios o la crea si no existe */
  async getOrCreateConversation(userAId: number, userBId: number) {
    // Buscar conversación existente donde ambos participan
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { usuarioId: userAId } } },
          { participants: { some: { usuarioId: userBId } } },
        ],
      },
      include: { participants: true },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [{ usuarioId: userAId }, { usuarioId: userBId }],
        },
      },
      include: { participants: true },
    });
  }

  /** Mensajes de una conversación, ordenados cronológicamente */
  async getMessages(conversationId: number, since?: number) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        ...(since ? { id: { gt: since } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        usuario: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
    });
  }

  /** Enviar un mensaje */
  async sendMessage(conversationId: number, usuarioId: number, content: string) {
    return this.prisma.message.create({
      data: { conversationId, usuarioId, content },
      include: {
        usuario: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
    });
  }

  /**
   * Retorna { [friendId]: unreadCount } para todas las conversaciones del usuario.
   * Cuenta mensajes de otros participantes cuyo createdAt > lastReadAt del usuario.
   */
  async getUnreadCounts(userId: number): Promise<Record<number, number>> {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { usuarioId: userId },
      include: {
        conversation: {
          include: {
            participants: { where: { usuarioId: { not: userId } } },
            messages: {
              where: { usuarioId: { not: userId } },
              select: { id: true, createdAt: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    const result: Record<number, number> = {};

    for (const p of participations) {
      const friend = p.conversation.participants[0];
      if (!friend) continue;

      const lastRead = p.lastReadAt;
      const unread = lastRead
        ? p.conversation.messages.filter((m) => m.createdAt > lastRead).length
        : p.conversation.messages.length;

      if (unread > 0) result[friend.usuarioId] = unread;
    }

    return result;
  }

  /** Marca una conversación como leída para el usuario (actualiza lastReadAt) */
  async markAsRead(conversationId: number, userId: number): Promise<void> {
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, usuarioId: userId },
      data: { lastReadAt: new Date() },
    });
  }
}
