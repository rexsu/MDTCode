import { useState, useRef, useEffect } from 'react';
import { Button, List, Card, Typography, Avatar, message } from 'antd';
import { AudioOutlined, PauseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import request from '../../../lib/request';
import { Dialog } from '../../../types';
import { useSocket } from '../../../lib/SocketContext';

const { Text } = Typography;

// 模拟的 ASR 语料库
// const MOCK_ASR_STREAMS = [
//   "医生：你好，请问最近睡眠情况怎么样？",
//   "患者：还是不太好，昨晚又只睡了3个小时。",
//   "医生：这种状况持续多久了？有服用什么药物吗？",
//   "患者：大概两个月了，之前吃了点褪黑素，没用。",
//   "医生：好的，我们来看看你的检查报告。",
// ];

interface Props {
  dialogs: Dialog[];
  onRefresh: () => void;
}

export default function ExpertConsultationTab({ dialogs, onRefresh }: Props) {
  const { id: taskId } = useParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [realtimeText, setRealtimeText] = useState(''); // 实时识别的文本
  const streamIndexRef = useRef(0);
  // const timerRef = useRef<any>(null);
  
  // Web Audio API 相关引用
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null); // 新增 source ref 防止 GC
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef<boolean>(false); // 使用 Ref 追踪录音状态，避免闭包陷阱
  const socket = useSocket();

  // 监听 ASR 结果
  useEffect(() => {
    if (socket) {
      const handleAsrResult = (data: { taskId: string; text: string; isFinal: boolean }) => {
        // console.log('[ASR Result]', data); // Debug log
        if (data.taskId === taskId) {
           setRealtimeText(prev => data.text);
        }
      };
      socket.on('asrResult', handleAsrResult);
      return () => {
        socket.off('asrResult', handleAsrResult);
      };
    }
  }, [socket, taskId]);

  // 开始录音
  const startRecording = async () => {
    if (!socket) {
      message.error('Socket未连接，无法进行实时语音识别');
      return;
    }

    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log('Microphone access granted.');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      // 移除强制 sampleRate: 16000，使用系统默认值以避免某些浏览器/硬件不支持导致 context 挂起或不触发回调
      const audioContext = new AudioContextClass(); 
      audioContextRef.current = audioContext;
      console.log('AudioContext created, state:', audioContext.state);
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('AudioContext resumed, state:', audioContext.state);
      }

      // 使用 ScriptProcessorNode (确保兼容性和简单性，排查 AudioWorklet 加载问题)
      const source = audioContext.createMediaStreamSource(stream);
      audioSourceRef.current = source; // 保持引用

      // bufferSize: 4096 (约 0.085s at 48k)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      console.log('ScriptProcessor created, bufferSize:', processor.bufferSize);
      
      processor.onaudioprocess = (e) => {
        // console.log('onaudioprocess triggered'); // 极端调试
        if (!isRecordingRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const currentSampleRate = audioContext.sampleRate;
        
        // 降采样并转换为 16k PCM
        const pcmData = downsampleBuffer(inputData, currentSampleRate, 16000);
        
        if (pcmData.length > 0) {
          // console.log(`Sending PCM data: ${pcmData.byteLength} bytes`); 
          socket.emit('audioData', pcmData.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // 通知后端开启 ASR 会话
      console.log('Emitting startAsr event...');
      socket.emit('startAsr', taskId);
      
      setIsRecording(true);
      isRecordingRef.current = true;
      message.success('开始实时语音识别');
    } catch (err) {
      console.error('无法获取麦克风权限或启动录音失败', err);
      message.error('无法启动录音，请检查麦克风权限');
    }
  };

  // 停止录音
  const stopRecording = () => {
    console.log('Stopping recording...');
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current = null;
    }
    
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (socket) {
      socket.emit('stopAsr');
    }
    
    setIsRecording(false);
    isRecordingRef.current = false;
  };

  // 降采样 + Float32转Int16 (Little Endian)
  const downsampleBuffer = (buffer: Float32Array, sampleRate: number, outSampleRate: number) => {
    let resultBuffer: Float32Array;
    
    if (outSampleRate === sampleRate) {
      resultBuffer = buffer;
    } else {
      const sampleRateRatio = sampleRate / outSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      resultBuffer = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      
      while (offsetResult < newLength) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0, count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        resultBuffer[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
    }
    
    // Convert Float32 to Int16 (Little Endian)
    const output = new DataView(new ArrayBuffer(resultBuffer.length * 2));
    for (let i = 0; i < resultBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, resultBuffer[i]));
      // 0x7FFF = 32767
      output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true for Little Endian
    }
    
    return new Int8Array(output.buffer);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmitSegment = async () => {
    // 提交实时转录的文本（优先使用 FunASR 的结果，如果没有则使用模拟文本）
    const textToSubmit = realtimeText || currentText;
    
    if (!textToSubmit) return;
    try {
      await request.post(`/tasks/${taskId}/dialogs`, {
        content: textToSubmit,
        startTime: Date.now(),
        // role 由后端 AI 自动判断
      });
      message.success('对话片段已生成');
      setCurrentText('');
      setRealtimeText(''); // 清空实时文本
      streamIndexRef.current += 1;
      onRefresh(); // 刷新列表
    } catch (error) {
      // handled
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* 左侧：录音控制与实时转录 */}
      <Card title="现场录音与转录" className="flex-1 flex flex-col h-full" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex justify-center mb-6">
          <Button
            type={isRecording ? 'default' : 'primary'}
            danger={isRecording}
            shape="circle"
            size="large"
            icon={isRecording ? <PauseCircleOutlined /> : <AudioOutlined />}
            onClick={handleToggleRecord}
            style={{ width: 64, height: 64, fontSize: 24 }}
          />
        </div>
        
        <div className="flex-1 bg-gray-50 p-4 rounded border border-gray-200 overflow-y-auto mb-4 min-h-[200px]">
          {realtimeText ? (
             <div className="mb-4">
               <Text strong className="block mb-2 text-blue-600">实时识别中:</Text>
               <Text className="text-lg text-gray-800">{realtimeText}</Text>
             </div>
          ) : currentText ? (
            <Text className="text-lg text-gray-700 animate-pulse">
              {currentText}
            </Text>
          ) : (
            <Text type="secondary">点击麦克风开始录音，AI 将实时转录...</Text>
          )}
        </div>

        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSubmitSegment}
          disabled={(!currentText && !realtimeText) || isRecording}
          block
        >
          提交本段对话 (AI清洗)
        </Button>
      </Card>

      {/* 右侧：生成的对话列表 */}
      <Card title="问诊对话记录 (已清洗)" className="flex-1 h-full flex flex-col" bodyStyle={{ flex: 1, overflowY: 'auto' }}>
        <List
          itemLayout="horizontal"
          dataSource={dialogs}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ backgroundColor: item.role === 'DOCTOR' ? '#1890ff' : '#87d068' }}
                  >
                    {item.role === 'DOCTOR' ? '医' : '患'}
                  </Avatar>
                }
                title={item.role === 'DOCTOR' ? '医生' : '患者'}
                description={item.content}
              />
            </List.Item>
          )}
        />
        {dialogs.length === 0 && <div className="text-center text-gray-400 mt-8">暂无对话记录</div>}
      </Card>
    </div>
  );
}

