import { useState, useRef, useEffect } from 'react';
import { Button, List, Card, Typography, Avatar, message } from 'antd';
import { AudioOutlined, PauseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import request from '../../../lib/request';
import { Dialog } from '../../../types';

const { Text } = Typography;

// 模拟的 ASR 语料库
const MOCK_ASR_STREAMS = [
  "医生：你好，请问最近睡眠情况怎么样？",
  "患者：还是不太好，昨晚又只睡了3个小时。",
  "医生：这种状况持续多久了？有服用什么药物吗？",
  "患者：大概两个月了，之前吃了点褪黑素，没用。",
  "医生：好的，我们来看看你的检查报告。",
];

interface Props {
  dialogs: Dialog[];
  onRefresh: () => void;
}

export default function ExpertConsultationTab({ dialogs, onRefresh }: Props) {
  const { id: taskId } = useParams<{ id: string }>();
  const [isRecording, setIsRecording] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const streamIndexRef = useRef(0);
  const timerRef = useRef<any>(null);

  // 模拟 ASR 流式输入
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const targetSentence = MOCK_ASR_STREAMS[streamIndexRef.current % MOCK_ASR_STREAMS.length];
        
        setCurrentText(prev => {
          if (prev.length < targetSentence.length) {
            return targetSentence.slice(0, prev.length + 1);
          }
          return prev; // 句子模拟完成
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (isRecording) {
      // 暂停录音，准备提交
      setIsRecording(false);
    } else {
      // 开始录音
      setIsRecording(true);
      if (currentText && currentText === MOCK_ASR_STREAMS[streamIndexRef.current % MOCK_ASR_STREAMS.length]) {
        // 如果上一句已完成，准备下一句
        setCurrentText('');
        streamIndexRef.current += 1;
      }
    }
  };

  const handleSubmitSegment = async () => {
    if (!currentText) return;
    try {
      await request.post(`/tasks/${taskId}/dialogs`, {
        content: currentText,
        startTime: Date.now(), // 简化时间戳
        // role 由后端 AI 自动判断
      });
      message.success('对话片段已生成');
      setCurrentText('');
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
          {currentText ? (
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
          disabled={!currentText || isRecording}
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
