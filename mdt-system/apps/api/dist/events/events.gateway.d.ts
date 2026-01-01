import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FunAsrService } from './funasr.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private funAsrService;
    server: Server;
    private logger;
    constructor(funAsrService: FunAsrService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(taskId: string, client: Socket): {
        event: string;
        data: string;
    };
    handleLeaveRoom(taskId: string, client: Socket): void;
    broadcastToRoom(roomId: string, event: string, payload: any): void;
    handleStartAsr(taskId: string, client: Socket): {
        event: string;
    };
    handleAudioData(data: Buffer, client: Socket): void;
    handleStopAsr(client: Socket): {
        event: string;
    };
}
