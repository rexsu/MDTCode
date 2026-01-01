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
var FunAsrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunAsrService = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const config_1 = require("@nestjs/config");
let FunAsrService = FunAsrService_1 = class FunAsrService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FunAsrService_1.name);
        this.connections = new Map();
        this.apiKey = this.configService.get('DASHSCOPE_API_KEY') || '';
        this.wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
    }
    startSession(localTaskId, onResult) {
        if (!this.apiKey) {
            this.logger.error('DASHSCOPE_API_KEY not found in env');
            return;
        }
        if (this.connections.has(localTaskId)) {
            this.logger.warn(`Session for ${localTaskId} already exists.`);
            return;
        }
        const ws = new ws_1.WebSocket(this.wsUrl, {
            headers: {
                Authorization: `bearer ${this.apiKey}`,
            },
        });
        const aliTaskId = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 32);
        ws.on('open', () => {
            this.logger.log(`Connected to FunASR for task ${localTaskId}`);
            this.sendRunTask(ws, aliTaskId);
        });
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(message, localTaskId, onResult, ws);
            }
            catch (error) {
                this.logger.error(`Failed to parse message: ${error}`);
            }
        });
        ws.on('close', () => {
            this.logger.log(`Connection closed for task ${localTaskId}`);
            this.connections.delete(localTaskId);
        });
        ws.on('error', (error) => {
            this.logger.error(`WebSocket error for task ${localTaskId}: ${error}`);
            this.connections.delete(localTaskId);
        });
        this.connections.set(localTaskId, ws);
    }
    sendAudioChunk(localTaskId, chunk) {
        const ws = this.connections.get(localTaskId);
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(chunk);
        }
        else {
        }
    }
    stopSession(localTaskId) {
        const ws = this.connections.get(localTaskId);
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
        }
        if (ws)
            ws.close();
        this.connections.delete(localTaskId);
    }
    sendRunTask(ws, aliTaskId) {
        const runTaskMessage = {
            header: {
                action: 'run-task',
                task_id: aliTaskId,
                streaming: 'duplex',
            },
            payload: {
                task_group: 'audio',
                task: 'asr',
                function: 'recognition',
                model: 'fun-asr-realtime',
                parameters: {
                    sample_rate: 16000,
                    format: 'pcm',
                },
                input: {},
            },
        };
        ws.send(JSON.stringify(runTaskMessage));
    }
    handleMessage(message, localTaskId, onResult, ws) {
        if (!message.header)
            return;
        switch (message.header.event) {
            case 'task-started':
                this.logger.log(`FunASR Task started for ${localTaskId}`);
                break;
            case 'result-generated':
                if (message.payload && message.payload.output && message.payload.output.sentence) {
                    const text = message.payload.output.sentence.text;
                    onResult({
                        text,
                        isFinal: false,
                        taskId: localTaskId
                    });
                }
                break;
            case 'task-finished':
                this.logger.log(`FunASR Task finished for ${localTaskId}`);
                ws.close();
                break;
            case 'task-failed':
                this.logger.error(`FunASR Task failed: ${message.header.error_message}`);
                ws.close();
                break;
            default:
                break;
        }
    }
};
exports.FunAsrService = FunAsrService;
exports.FunAsrService = FunAsrService = FunAsrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FunAsrService);
//# sourceMappingURL=funasr.service.js.map