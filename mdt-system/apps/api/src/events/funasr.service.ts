import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// 识别结果接口定义
export interface AsrResult {
  text: string;
  isFinal: boolean;
  taskId: string; // 本地任务 ID，非阿里云 task_id
}

@Injectable()
export class FunAsrService {
  private logger = new Logger(FunAsrService.name);
  private connections: Map<string, WebSocket> = new Map(); // map<localTaskId, ws>
  private readyStates: Map<string, boolean> = new Map();   // map<localTaskId, isReady>
  private apiKey: string;
  private wsUrl: string;
  private model: string = 'qwen3-asr-flash-realtime'; // 默认模型，可配置

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DASHSCOPE_API_KEY') || '';
    this.wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
  }

  private isQwenModel(model: string): boolean {
    return model.includes('qwen');
  }

  // 启动一个新的识别任务会话
  public startSession(localTaskId: string, onResult: (result: AsrResult) => void) {
    if (!this.apiKey) {
      this.logger.error('DASHSCOPE_API_KEY not found in env');
      return;
    }

    if (this.connections.has(localTaskId)) {
      this.logger.warn(`Session for ${localTaskId} already exists.`);
      return;
    }

    // 初始化状态
    this.readyStates.set(localTaskId, false);

    // 根据模型选择 URL
    let url = this.wsUrl;
    if (this.isQwenModel(this.model)) {
        url = `wss://dashscope.aliyuncs.com/api-ws/v1/realtime?model=${this.model}`;
    }

    this.logger.log(`Connecting to ${url} for task ${localTaskId}`);

    const ws = new WebSocket(url, {
      headers: {
        Authorization: `bearer ${this.apiKey}`,
      },
    });

    const aliTaskId = uuidv4().replace(/-/g, '').slice(0, 32);

    ws.on('open', () => {
      this.logger.log(`✅ [FunASR] Connected to Aliyun WebSocket for task ${localTaskId}`);
      
      if (this.isQwenModel(this.model)) {
          // Qwen 协议：连接建立即视为 Ready，可以开始发 session.update 或直接发音频
          this.readyStates.set(localTaskId, true);
          this.sendQwenSessionUpdate(ws);
      } else {
          // FunASR 协议：需要发送 run-task
          this.logger.debug(`[FunASR] Sending run-task command...`);
          this.sendRunTask(ws, aliTaskId);
      }
    });

    ws.on('message', (data: any) => {
      try {
        const message = JSON.parse(data.toString());
        // this.logger.debug(`[FunASR] Received message: ${JSON.stringify(message).slice(0, 200)}...`);
        
        if (this.isQwenModel(this.model)) {
            this.handleQwenMessage(message, localTaskId, onResult, ws);
        } else {
            this.handleMessage(message, localTaskId, onResult, ws);
        }
      } catch (error) {
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

  // 发送音频数据块
  public sendAudioChunk(localTaskId: string, chunk: Buffer) {
    const ws = this.connections.get(localTaskId);
    const isReady = this.readyStates.get(localTaskId);
    
    // Debug: 将接收到的 PCM 数据写入文件
    try {
        const debugPath = path.resolve(__dirname, '../../debug_audio.pcm');
        // fs.appendFileSync(debugPath, chunk);
    } catch (e) {
        // console.error('Write debug pcm failed:', e);
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (isReady) {
        // this.logger.debug(`[FunASR] Sending audio chunk size: ${chunk.length}`);
        
        if (this.isQwenModel(this.model)) {
            // Qwen 协议：使用 JSON 事件发送 Base64 音频
            const event = {
                type: 'input_audio_buffer.append',
                audio: chunk.toString('base64'),
            };
            ws.send(JSON.stringify(event));
        } else {
            // FunASR 协议：直接发送二进制
            ws.send(chunk, { binary: true }); 
        }
      } else {
        this.logger.debug(`[FunASR] Connection not ready yet, dropping chunk size: ${chunk.length}`);
      }
    } else {
      // 降低日志频率，避免刷屏
      // this.logger.warn(`[FunASR] WebSocket not open for task ${localTaskId} (State: ${ws?.readyState}), dropping chunk.`);
    }
  }

  // 结束会话
  public stopSession(localTaskId: string) {
    const ws = this.connections.get(localTaskId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      // 发送 finish-task 指令
      // 注意：这里需要 aliTaskId，但在 startSession 里是局部变量。
      // 为简化，可以在 ws 对象上挂载 aliTaskId，或者只发送关闭帧等待服务器断开
      // 根据文档，建议发送 finish-task。我们需要把 aliTaskId 存下来。
      // 这里简化处理：直接关闭，或者发送空的 finish frame 如果协议支持。
      // 标准协议需要 task_id。我们在下面改进一下存储结构。
    }
    // 简单粗暴关闭
    if (ws) ws.close();
    this.connections.delete(localTaskId);
    this.readyStates.delete(localTaskId);
  }

  private sendQwenSessionUpdate(ws: WebSocket) {
    const sessionUpdate = {
        type: 'session.update',
        session: {
            input_audio_format: 'pcm', // 支持 pcm 或 g711_ulaw 等
            // turn_detection: { type: 'server_vad' }, // 开启服务端 VAD
        },
    };
    ws.send(JSON.stringify(sessionUpdate));
  }

  private handleQwenMessage(message: any, localTaskId: string, onResult: (res: AsrResult) => void, ws: WebSocket) {
    // 处理 Qwen 协议的事件
    // 常见事件: input_audio_buffer.committed, input_audio_buffer.speech_started, conversation.item.input_audio_transcription.completed
    
    switch (message.type) {
        case 'session.created':
            this.logger.log(`Qwen Session created: ${message.session?.id}`);
            break;
        case 'input_audio_buffer.speech_started':
            this.logger.debug('Speech started');
            break;
        case 'conversation.item.input_audio_transcription.completed':
            // 最终结果
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
            // 实时中间结果通常通过 response.audio_transcript.delta 或类似事件返回，具体依赖模型版本
            // 对于 qwen-realtime，中间结果可能在 response.content_part.added 或 response.audio_transcript.delta 中
            // 这里暂只处理 completed 事件
            break;
    }
  }

  private sendRunTask(ws: WebSocket, aliTaskId: string) {
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
        model: 'qwen3-asr-flash', // 使用标准的实时语音识别模型
        parameters: {
          sample_rate: 16000,
          format: 'pcm', // 前端录音通常是 pcm 或 wav，这里假设传输裸流
        },
        input: {},
      },
    };
    ws.send(JSON.stringify(runTaskMessage));
  }

  private handleMessage(message: any, localTaskId: string, onResult: (res: AsrResult) => void, ws: WebSocket) {
    if (!message.header) return;

    switch (message.header.event) {
      case 'task-started':
        this.logger.log(`FunASR Task started for ${localTaskId}`);
        this.readyStates.set(localTaskId, true); // 标记为就绪
        break;
      case 'result-generated':
        // 实时结果
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
}
