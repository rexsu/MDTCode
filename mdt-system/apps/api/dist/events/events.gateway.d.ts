import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(taskId: string, client: Socket): {
        event: string;
        data: string;
    };
    handleLeaveRoom(taskId: string, client: Socket): void;
    broadcastToRoom(roomId: string, event: string, payload: any): void;
}
