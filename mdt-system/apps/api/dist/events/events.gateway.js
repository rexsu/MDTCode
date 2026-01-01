"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const funasr_service_1 = require("./funasr.service");
let EventsGateway = class EventsGateway {
    constructor(funAsrService) {
        this.funAsrService = funAsrService;
        this.logger = new common_1.Logger('EventsGateway');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.funAsrService.stopSession(client.id);
    }
    handleJoinRoom(taskId, client) {
        client.join(taskId);
        this.logger.log(`Client ${client.id} joined room ${taskId}`);
        return { event: 'joined', data: taskId };
    }
    handleLeaveRoom(taskId, client) {
        client.leave(taskId);
        this.logger.log(`Client ${client.id} left room ${taskId}`);
    }
    broadcastToRoom(roomId, event, payload) {
        this.server.to(roomId).emit(event, payload);
        this.logger.log(`Broadcast ${event} to room ${roomId}`);
    }
    handleStartAsr(taskId, client) {
        this.logger.log(`Start ASR session for client ${client.id}, task ${taskId}`);
        this.funAsrService.startSession(client.id, (result) => {
            client.emit('asrResult', {
                taskId,
                text: result.text,
                isFinal: result.isFinal,
            });
            if (result.isFinal) {
                this.broadcastToRoom(taskId, 'asrResultBroadcast', {
                    taskId,
                    text: result.text,
                    speakerId: client.id,
                });
            }
        });
        return { event: 'asrStarted' };
    }
    handleAudioData(data, client) {
        this.funAsrService.sendAudioChunk(client.id, data);
    }
    handleStopAsr(client) {
        this.logger.log(`Stop ASR session for client ${client.id}`);
        this.funAsrService.stopSession(client.id);
        return { event: 'asrStopped' };
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startAsr'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleStartAsr", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('audioData'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer,
        socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleAudioData", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopAsr'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleStopAsr", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [funasr_service_1.FunAsrService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map