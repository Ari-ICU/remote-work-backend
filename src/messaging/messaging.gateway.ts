import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);
      client.data.user = { id: payload.sub };
      // Join a room named after the user ID for targeted messages
      client.join(payload.sub);
      console.log(`User connected to chat: ${payload.sub}`);
    } catch (e) {
      console.log('Chat connection failed:', e.message);
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string; type?: string; fileUrl?: string }
  ) {
    if (!client.data.user) return;
    const senderId = client.data.user.id;

    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId,
        receiverId: data.receiverId,
        type: data.type || 'TEXT',
        fileUrl: data.fileUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      }
    });

    this.server.to(data.receiverId).emit('newMessage', message);
    this.server.to(senderId).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; content: string }
  ) {
    if (!client.data.user) return;
    const senderId = client.data.user.id;

    const message = await this.prisma.message.update({
      where: { id: data.messageId, senderId },
      data: { content: data.content },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
    });

    this.server.to(message.receiverId).emit('messageUpdated', message);
    this.server.to(senderId).emit('messageUpdated', message);
    return message;
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string }
  ) {
    if (!client.data.user) return;
    const senderId = client.data.user.id;

    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId }
    });

    if (message && message.senderId === senderId) {
      await this.prisma.message.delete({ where: { id: data.messageId } });
      this.server.to(message.receiverId).emit('messageDeleted', { messageId: data.messageId });
      this.server.to(senderId).emit('messageDeleted', { messageId: data.messageId });
    }
  }

  @SubscribeMessage('deleteConversation')
  async handleDeleteConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { otherUserId: string }
  ) {
    if (!client.data.user) return;
    const userId = client.data.user.id;

    await this.prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: data.otherUserId },
          { senderId: data.otherUserId, receiverId: userId }
        ]
      }
    });

    this.server.to(data.otherUserId).emit('conversationDeleted', { userId });
    this.server.to(userId).emit('conversationDeleted', { otherUserId: data.otherUserId });
  }
}