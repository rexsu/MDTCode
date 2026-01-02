import { ConfigService } from '@nestjs/config';
export interface AsrResult {
    text: string;
    isFinal: boolean;
    taskId: string;
}
export declare class FunAsrService {
    private configService;
    private logger;
    private connections;
    private readyStates;
    private apiKey;
    private wsUrl;
    constructor(configService: ConfigService);
    startSession(localTaskId: string, onResult: (result: AsrResult) => void): void;
    sendAudioChunk(localTaskId: string, chunk: Buffer): void;
    stopSession(localTaskId: string): void;
    private sendRunTask;
    private handleMessage;
}
