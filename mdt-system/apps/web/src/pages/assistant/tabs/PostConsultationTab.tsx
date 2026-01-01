import { useState, useEffect } from 'react';
import { Button, Card, Typography, Input, Space, message, Alert, Row, Col } from 'antd';
import { RobotOutlined, SaveOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import request from '../../../lib/request';
import { PostDoc } from '../../../types';
import { useSocket } from '../../../lib/SocketContext';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

interface Props {
  data?: PostDoc;
  onRefresh: () => void;
}

export default function PostConsultationTab({ data, onRefresh }: Props) {
  const { id: taskId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const socket = useSocket();

  useEffect(() => {
    if (data?.finalContent) {
      setContent(data.finalContent);
    }
  }, [data]);

  // 监听广播：如果有其他助理提交了文书
  useEffect(() => {
    if (socket) {
      const handleDocSubmitted = (payload: any) => {
        if (payload.isSubmitted) {
          message.info('其他用户已提交了会诊文书');
          onRefresh();
        }
      };
      socket.on('POST_DOC_SUBMITTED', handleDocSubmitted);
      return () => {
        socket.off('POST_DOC_SUBMITTED', handleDocSubmitted);
      };
    }
  }, [socket, onRefresh]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await request.post(`/tasks/${taskId}/post-doc/generate`);
      message.success('AI 草稿生成成功');
      onRefresh();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isSubmitted: boolean) => {
    try {
      setLoading(true);
      await request.patch(`/tasks/${taskId}/post-doc`, {
        content,
        isSubmitted,
      });
      message.success(isSubmitted ? '文书已正式提交' : '草稿已保存');
      onRefresh();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  if (!data || !data.aiContent) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={4}>智能生成会诊文书</Title>
        <Paragraph className="text-gray-500 mb-6">
          AI 将基于当前的问诊对话记录，自动生成现病史、诊疗意见等结构化内容。
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleGenerate} 
          loading={loading}
          icon={<RobotOutlined />}
        >
          一键生成草稿
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {data.isSubmitted && (
        <Alert
          message="文书已提交"
          description="当前文书已归档，如需修改请联系管理员解锁。"
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      <Row gutter={16} className="flex-1 min-h-0">
        {/* 左侧：AI 原始草稿 (参考) */}
        <Col span={10} className="h-full">
          <Card title="AI 原始草稿 (参考)" className="h-full flex flex-col" bodyStyle={{ flex: 1, overflowY: 'auto' }}>
            <div className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-4 rounded">
              {data.aiContent}
            </div>
          </Card>
        </Col>

        {/* 右侧：编辑区域 */}
        <Col span={14} className="h-full">
          <Card 
            title="文书编辑区" 
            className="h-full flex flex-col" 
            bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            extra={
              !data.isSubmitted && (
                <Space>
                  <Button icon={<SaveOutlined />} onClick={() => handleSave(false)} loading={loading}>
                    暂存
                  </Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleSave(true)} loading={loading}>
                    正式提交
                  </Button>
                </Space>
              )
            }
          >
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={data.isSubmitted}
              style={{ flex: 1, resize: 'none' }}
              className="text-base leading-relaxed"
              placeholder="在此处编辑最终文书..."
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
