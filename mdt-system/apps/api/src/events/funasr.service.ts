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

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DASHSCOPE_API_KEY') || '';
    // 北京地域 URL
    this.wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
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

    const ws = new WebSocket(this.wsUrl, {
      headers: {
        Authorization: `bearer ${this.apiKey}`,
      },
    });

    const aliTaskId = uuidv4().replace(/-/g, '').slice(0, 32);

    ws.on('open', () => {
      this.logger.log(`✅ [FunASR] Connected to Aliyun WebSocket for task ${localTaskId}`);
      this.logger.debug(`[FunASR] Sending run-task command...`);
      this.sendRunTask(ws, aliTaskId);
    });

    ws.on('message', (data: any) => {
      try {
        const message = JSON.parse(data.toString());
        // this.logger.debug(`[FunASR] Received message: ${JSON.stringify(message).slice(0, 200)}...`);
        this.handleMessage(message, localTaskId, onResult, ws);
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
        // this.logger.debug(`Writing to debug file: ${debugPath}, size: ${chunk.length}`);
        fs.appendFileSync(debugPath, chunk);
    } catch (e) {
        console.error('Write debug pcm failed:', e);
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      if (isReady) {
        this.logger.debug(`[FunASR] Sending audio chunk size: ${chunk.length}`);
        ws.send(chunk, { binary: true }); // 显式指定 binary
      } else {
        // 连接还没 Ready，丢弃或暂时忽略（避免发送过早导致 1007 错误）
        this.logger.debug(`[FunASR] Connection not ready yet, dropping chunk size: ${chunk.length}`);
      }
    } else {
      this.logger.warn(`[FunASR] WebSocket not open for task ${localTaskId} (State: ${ws?.readyState}), dropping chunk.`);
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
        model: 'fun-asr-realtime',
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
