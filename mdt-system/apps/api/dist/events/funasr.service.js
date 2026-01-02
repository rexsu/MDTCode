"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const path = __importStar(require("path"));
let FunAsrService = FunAsrService_1 = class FunAsrService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FunAsrService_1.name);
        this.connections = new Map();
        this.readyStates = new Map();
        this.model = 'qwen3-asr-flash-realtime';
        this.apiKey = this.configService.get('DASHSCOPE_API_KEY') || '';
        this.wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
    }
    isQwenModel(model) {
        return model.includes('qwen');
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
        this.readyStates.set(localTaskId, false);
        let url = this.wsUrl;
        if (this.isQwenModel(this.model)) {
            url = `wss://dashscope.aliyuncs.com/api-ws/v1/realtime?model=${this.model}`;
        }
        this.logger.log(`Connecting to ${url} for task ${localTaskId}`);
        const ws = new ws_1.WebSocket(url, {
            headers: {
                Authorization: `bearer ${this.apiKey}`,
            },
        });
        const aliTaskId = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 32);
        ws.on('open', () => {
            this.logger.log(`✅ [FunASR] Connected to Aliyun WebSocket for task ${localTaskId}`);
            if (this.isQwenModel(this.model)) {
                this.readyStates.set(localTaskId, true);
                this.sendQwenSessionUpdate(ws);
            }
            else {
                this.logger.debug(`[FunASR] Sending run-task command...`);
                this.sendRunTask(ws, aliTaskId);
            }
        });
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (this.isQwenModel(this.model)) {
                    this.handleQwenMessage(message, localTaskId, onResult, ws);
                }
                else {
                    this.handleMessage(message, localTaskId, onResult, ws);
                }
            }
            catch (error) {
                this.logger.error(`❌ [FunASR] Failed to parse message: ${error}`);
            }
        });
        ws.on('close', (code, reason) => {
            this.logger.log(`⚠️ [FunASR] Connection closed for task ${localTaskId}. Code: ${code}, Reason: ${reason}`);
            this.connections.delete(localTaskId);
            this.readyStates.delete(localTaskId);
        });
        ws.on('error', (error) => {
            this.logger.error(`❌ [FunASR] WebSocket error for task ${localTaskId}: ${error}`);
            this.connections.delete(localTaskId);
            this.readyStates.delete(localTaskId);
        });
        this.connections.set(localTaskId, ws);
    }
    sendAudioChunk(localTaskId, chunk) {
        const ws = this.connections.get(localTaskId);
        const isReady = this.readyStates.get(localTaskId);
        try {
            const debugPath = path.resolve(__dirname, '../../debug_audio.pcm');
        }
        catch (e) {
        }
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
            if (isReady) {
                if (this.isQwenModel(this.model)) {
                    const event = {
                        type: 'input_audio_buffer.append',
                        audio: chunk.toString('base64'),
                    };
                    ws.send(JSON.stringify(event));
                }
                else {
                    ws.send(chunk, { binary: true });
                }
            }
            else {
                this.logger.debug(`[FunASR] Connection not ready yet, dropping chunk size: ${chunk.length}`);
            }
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
        this.readyStates.delete(localTaskId);
    }
    sendQwenSessionUpdate(ws) {
        const sessionUpdate = {
            type: 'session.update',
            session: {
                input_audio_format: 'pcm',
            },
        };
        ws.send(JSON.stringify(sessionUpdate));
    }
    handleQwenMessage(message, localTaskId, onResult, ws) {
        switch (message.type) {
            case 'session.created':
                this.logger.log(`Qwen Session created: ${message.session?.id}`);
                break;
            case 'input_audio_buffer.speech_started':
                this.logger.debug('Speech started');
                break;
            case 'conversation.item.input_audio_transcription.completed':
                if (message.transcript) {
                    onResult({
                        text: message.transcript,
                        isFinal: true,
                        taskId: localTaskId
                    });
                }
                break;
            case 'conversation.item.input_audio_transcription.failed':
                this.logger.error(`Transcription failed: ${message.error?.message}`);
                break;
            case 'error':
                this.logger.error(`Qwen Error: ${message.error?.message}`);
                break;
            default:
                break;
        }
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
                model: 'qwen3-asr-flash',
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
                this.readyStates.set(localTaskId, true);
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