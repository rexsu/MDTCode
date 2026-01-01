import { useState, useEffect } from 'react';
import { Button, List, Card, Input, Space, Tag, Avatar, message } from 'antd';
import { AudioOutlined, SendOutlined, CheckCircleFilled, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import request from '../../../lib/request';
import { ExpertOpinion } from '../../../types';
import { useSocket } from '../../../lib/SocketContext';

const { TextArea } = Input;

interface Props {
  opinions: ExpertOpinion[];
  onRefresh: () => void;
}

export default function ExpertOpinionTab({ opinions, onRefresh }: Props) {
  const { id: taskId } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  // 监听意见更新
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => onRefresh();
      socket.on('OPINION_CREATED', handleUpdate);
      socket.on('OPINION_UPDATED', handleUpdate);
      return () => {
        socket.off('OPINION_CREATED', handleUpdate);
        socket.off('OPINION_UPDATED', handleUpdate);
      };
    }
  }, [socket, onRefresh]);

  const handleSubmit = async (isAudio: boolean) => {
    if (!content) return;
    try {
      setLoading(true);
      await request.post(`/tasks/${taskId}/opinions`, {
        expertProfileId: 'mock-expert-id', // 后端会自动处理 Mock
        content,
        isAudio,
      });
      message.success('意见发表成功');
      setContent('');
      onRefresh();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdopt = async (opinion: ExpertOpinion) => {
    try {
      await request.patch(`/tasks/opinions/${opinion.id}/adopt`, {
        isAdopted: !opinion.isAiAdopted
      });
      message.success(opinion.isAiAdopted ? '已取消采纳' : '已采纳该意见');
      onRefresh();
    } catch (error) {
      // handled
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* 左侧：发表意见 */}
      <Card title="发表专家意见" className="w-1/3 flex flex-col">
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="请输入诊断意见，或点击录音按钮..."
          style={{ height: 200, resize: 'none' }}
          className="mb-4 text-base"
        />
        <Space className="w-full justify-between">
          <Button 
            icon={<AudioOutlined />} 
            onClick={() => {
              setIsRecording(!isRecording);
              if (!isRecording) {
                message.info('开始模拟录音：自动填充文字...');
                setContent('我认为患者目前的焦虑症状主要源于工作压力，建议结合认知行为疗法进行干预。');
              }
            }}
            danger={isRecording}
          >
            {isRecording ? '停止录音' : '语音输入'}
          </Button>
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={() => handleSubmit(isRecording)} // 如果刚才点了录音，就当做音频提交
            loading={loading}
            disabled={!content}
          >
            发送意见
          </Button>
        </Space>
      </Card>

      {/* 右侧：意见列表 */}
      <Card title="专家意见汇总" className="w-2/3 overflow-y-auto">
        <List
          itemLayout="vertical"
          dataSource={opinions}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className="bg-gray-50 mb-4 rounded p-4 border border-gray-100"
              actions={[
                <Button 
                  type={item.isAiAdopted ? 'primary' : 'default'}
                  icon={item.isAiAdopted ? <CheckCircleFilled /> : <CheckCircleOutlined />}
                  onClick={() => handleToggleAdopt(item)}
                  size="small"
                >
                  {item.isAiAdopted ? '已采纳' : '采纳此意见'}
                </Button>,
                <span className="text-gray-400 text-xs">{item.createdAt}</span>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />}
                title={
                  <Space>
                    <span className="font-bold">{item.expert.user.realName}</span>
                    <Tag color="blue">{item.expert.department}</Tag>
                  </Space>
                }
                description={
                  <div>
                    {item.asrText && (
                      <div className="text-gray-400 text-xs mb-2">
                        [语音转录] {item.asrText}
                      </div>
                    )}
                    <div className="text-gray-800 text-base">
                      {item.aiStructured ? (
                        <div className="whitespace-pre-wrap">{item.aiStructured}</div>
                      ) : (
                        item.finalText
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {opinions.length === 0 && <div className="text-center text-gray-400 mt-12">暂无专家发表意见</div>}
      </Card>
    </div>
  );
}
