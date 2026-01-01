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
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const socket = useSocket();

  // 监听 ASR 结果
  useEffect(() => {
    if (socket) {
      const handleAsrResult = (data: { taskId: string; text: string; isFinal: boolean }) => {
        if (data.taskId === taskId) {
           if (data.isFinal) {
             setRealtimeText(prev => prev + data.text);
             // 自动刷新列表以显示最新入库的对话（如果后端做了自动保存）
             // 目前后端逻辑是前端手动提交，所以这里只更新实时文本
           } else {
             // 临时中间结果
             // setRealtimeText(prev => prev + data.text); // 简单追加，实际需要处理覆盖逻辑
           }
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 }); // FunASR 要求 16k
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // bufferSize: 2048, inputChannels: 1, outputChannels: 1
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isRecording) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // 将 float32 转为 int16 (PCM)
        const pcmData = float32ToInt16(inputData);
        
        // 通过 socket 发送二进制数据
        socket.emit('audioData', pcmData.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // 通知后端开启 ASR 会话
      socket.emit('startAsr', taskId);
      
      setIsRecording(true);
      message.success('开始实时语音识别');
    } catch (err) {
      console.error('无法获取麦克风权限', err);
      message.error('无法启动录音，请检查麦克风权限');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
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
  };

  // 辅助函数：Float32Array 转 Int16Array
  const float32ToInt16 = (buffer: Float32Array) => {
    let l = buffer.length;
    let buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
    }
    return buf;
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

