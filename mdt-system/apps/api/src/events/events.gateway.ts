import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 客户端加入房间 (Room = TaskId)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(taskId);
    this.logger.log(`Client ${client.id} joined room ${taskId}`);
    return { event: 'joined', data: taskId };
  }

  // 离开房间
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() taskId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(taskId);
    this.logger.log(`Client ${client.id} left room ${taskId}`);
  }

  // 广播消息给指定房间
  broadcastToRoom(roomId: string, event: string, payload: any) {
    this.server.to(roomId).emit(event, payload);
    this.logger.log(`Broadcast ${event} to room ${roomId}`);
  }
}
