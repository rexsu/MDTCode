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
import { FunAsrService } from './funasr.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');

  constructor(private funAsrService: FunAsrService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // 客户端断开时，尝试关闭对应的 ASR 会话（如果存在）
    this.funAsrService.stopSession(client.id);
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

  // --- FunASR 实时语音识别相关事件 ---

  // 1. 开启实时识别会话
  @SubscribeMessage('startAsr')
  handleStartAsr(
    @MessageBody() taskId: string, // 业务上的 taskId
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Start ASR session for client ${client.id}, task ${taskId}`);
    
    // 使用 client.id 作为 localTaskId，确保每个连接独立
    this.funAsrService.startSession(client.id, (result) => {
      // 收到识别结果，回传给客户端
      client.emit('asrResult', {
        taskId,
        text: result.text,
        isFinal: result.isFinal,
      });
      
      // 可选：如果是最终结果，也可以广播给房间内的其他人
      if (result.isFinal) {
        this.broadcastToRoom(taskId, 'asrResultBroadcast', {
           taskId,
           text: result.text,
           speakerId: client.id, // 暂用 socket id 区分说话人
        });
      }
    });
    
    return { event: 'asrStarted' };
  }

  // 2. 接收音频流数据
  @SubscribeMessage('audioData')
  handleAudioData(
    @MessageBody() data: Buffer, // 接收二进制音频流
    @ConnectedSocket() client: Socket,
  ) {
    // 转发给 FunASR 服务
    this.funAsrService.sendAudioChunk(client.id, data);
  }

  // 3. 停止识别会话
  @SubscribeMessage('stopAsr')
  handleStopAsr(@ConnectedSocket() client: Socket) {
    this.logger.log(`Stop ASR session for client ${client.id}`);
    this.funAsrService.stopSession(client.id);
    return { event: 'asrStopped' };
  }
}

