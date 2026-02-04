import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../common/prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagingGateway {
  @WebSocketServer() server: Server;

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string }
  ) {
    const senderId = client.data.user.id; // Assume user is attached via AuthGuard
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        senderId,
        receiverId: data.receiverId,
      },
    });

    this.server.to(data.receiverId).emit('newMessage', message);
    return message;
  }
}