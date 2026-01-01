import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Tag, Descriptions, Spin, message, Modal, Steps, Avatar, Tooltip, Layout, Badge } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, CheckCircleOutlined, FileTextOutlined, MedicineBoxOutlined, CommentOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Dialog } from '../../types';
import { TaskDetail } from "@/lib/request";
import request from '../../lib/request';
import ExpertConsultationTab from './tabs/ExpertConsultationTab';
import PostConsultationTab from './tabs/PostConsultationTab';
import ExpertOpinionTab from './tabs/ExpertOpinionTab';
import ReportTab from './tabs/ReportTab';
import { useSocket } from '../../lib/SocketContext';

const { Header, Content } = Layout;

// Tab 组件占位符
const PreDocTab = ({ data }: { data: any }) => (
  <Card 
    title="患者病历摘要" 
    bordered={false} 
    className="h-full flex flex-col"
    bodyStyle={{ flex: 1, overflowY: 'auto' }}
  >
    <Descriptions bordered column={1} size="middle" labelStyle={{ width: 120, fontWeight: 'bold' }}>
      <Descriptions.Item label="现病史">{data?.presentIllness}</Descriptions.Item>
      <Descriptions.Item label="既往史">{data?.pastHistory || '-'}</Descriptions.Item>
      <Descriptions.Item label="家族史">{data?.familyHistory || '-'}</Descriptions.Item>
      <Descriptions.Item label="其他信息">{data?.extraInfo || '-'}</Descriptions.Item>
    </Descriptions>
  </Card>
);

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const socket = useSocket();

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await request.get<any, TaskDetail>(`/tasks/${id}`);
      setTask(data);
      // 如果状态为 IN_PROGRESS 且当前还在 Tab 1，自动切到 Tab 2
      if (data.status === 'IN_PROGRESS' && activeTab === '1') {
        setActiveTab('2');
      }
    } catch (error) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
      
      if (socket) {
        // 加入房间
        socket.emit('joinRoom', id);

        // 监听任务更新 (如状态变更)
        const handleTaskUpdate = (data: any) => {
          console.log('Task Update Received:', data);
          if (data.type === 'STATUS_CHANGE') {
            message.info(`会诊状态已更新为: ${data.status}`);
            fetchDetail(); // 重新拉取数据
          }
        };

        // 监听新对话生成
        const handleDialogCreated = (newDialog: Dialog) => {
          console.log('New Dialog:', newDialog);
          setTask(prev => {
            if (!prev) return null;
            return {
              ...prev,
              dialogs: [...prev.dialogs, newDialog]
            };
          });
        };

        socket.on('TASK_UPDATED', handleTaskUpdate);
        socket.on('DIALOG_CREATED', handleDialogCreated);

        return () => {
          socket.emit('leaveRoom', id);
          socket.off('TASK_UPDATED', handleTaskUpdate);
          socket.off('DIALOG_CREATED', handleDialogCreated);
        };
      }
    }
  }, [id, socket]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    
    Modal.confirm({
      title: '确认操作',
      content: `确定要将状态变更为 ${newStatus === 'IN_PROGRESS' ? '会诊中' : '已结束'} 吗？`,
      onOk: async () => {
        try {
          await request.patch(`/tasks/${task.id}/status`, { status: newStatus });
          message.success('状态更新成功');
          fetchDetail(); // 刷新数据以更新 Tab 状态
          
          // 自动跳转 Tab
          if (newStatus === 'IN_PROGRESS') setActiveTab('2');
        } catch (error) {
          // handled
        }
      }
    });
  };

  if (loading) return <div className="p-12 text-center"><Spin size="large" /></div>;
  if (!task) return <div className="p-12 text-center">任务不存在</div>;

  // 状态机逻辑：Tab 解锁控制 (PRD 6.3.2)
  const isPending = task.status === 'PENDING';
  const isInProgress = task.status === 'IN_PROGRESS';
  const isCompleted = task.status === 'COMPLETED';

  // 计算当前步骤
  const currentStep = isPending ? 0 : (isInProgress ? 1 : 2);

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2 py-1 text-base">
          <FileTextOutlined /> 会诊前文书
        </span>
      ),
      children: <PreDocTab data={task.preDoc} />,
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2 py-1 text-base">
          <MedicineBoxOutlined /> 专家问诊
          {!isPending && activeTab !== '2' && <Badge status="processing" />}
        </span>
      ),
      children: <ExpertConsultationTab dialogs={task.dialogs || []} onRefresh={fetchDetail} />,
      disabled: isPending,
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2 py-1 text-base">
          <FileTextOutlined /> 会诊后文书
        </span>
      ),
      children: <PostConsultationTab data={task.postDoc} onRefresh={fetchDetail} />,
      disabled: isPending,
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-2 py-1 text-base">
          <CommentOutlined /> 专家意见
        </span>
      ),
      children: <ExpertOpinionTab opinions={task.opinions || []} onRefresh={fetchDetail} />,
      disabled: isPending,
    },
    {
      key: '5',
      label: (
        <span className="flex items-center gap-2 py-1 text-base">
          <FilePdfOutlined /> 会诊报告
        </span>
      ),
      children: <ReportTab task={task} onRefresh={fetchDetail} />,
      disabled: !isCompleted,
    },
  ];

  return (
    <Layout className="h-screen bg-[#f5f7fa] flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <Header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/tasks')} className="text-gray-500 hover:text-blue-600" />
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-800">{task.patientName}</span>
              <Tag color={task.patientGender === '男' ? 'blue' : 'magenta'} className="rounded-full px-2">{task.patientGender}</Tag>
              <span className="text-gray-500 text-sm">{task.patientAge}岁</span>
            </div>
            <div className="text-gray-400 text-xs mt-0.5 max-w-md truncate">
              主诉: {task.chiefComplaint}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
            <span className="text-xs text-gray-400">在线专家</span>
            <Avatar.Group maxCount={3} size="small">
              <Tooltip title="李主任 (精神科)"><Avatar style={{ backgroundColor: '#f56a00' }}>李</Avatar></Tooltip>
              <Tooltip title="张医师 (内科)"><Avatar style={{ backgroundColor: '#87d068' }}>张</Avatar></Tooltip>
              <Tooltip title="王医师 (神经科)"><Avatar style={{ backgroundColor: '#1890ff' }}>王</Avatar></Tooltip>
            </Avatar.Group>
          </div>
        </div>
      </Header>

      {/* 步骤条区域 */}
      <div className="bg-white border-b border-gray-100 px-12 py-4 shadow-sm z-10 shrink-0">
        <Steps
          current={currentStep}
          size="small"
          className="max-w-4xl mx-auto"
          items={[
            { title: '准备阶段', description: '完善病历', icon: <FileTextOutlined /> },
            { title: '会诊进行中', description: '专家问诊/研讨', icon: <MedicineBoxOutlined /> },
            { title: '归档阶段', description: '生成报告', icon: <FilePdfOutlined /> },
          ]}
        />
      </div>

      {/* 主体内容区 */}
      <Content className="p-4 flex-1 overflow-hidden min-h-0">
        <div className="bg-white rounded-xl shadow-sm h-full border border-gray-200 overflow-hidden flex">
          <Tabs
            tabPosition="left"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            className="h-full w-full custom-vertical-tabs"
            tabBarStyle={{ width: 220, paddingTop: 24, backgroundColor: '#fafafa', borderRight: '1px solid #f0f0f0' }}
          />
        </div>
      </Content>

      {/* 底部操作栏 */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-30 shrink-0">
        <div className="text-gray-500 text-sm">
          当前状态: <Tag color={isPending ? 'orange' : isInProgress ? 'processing' : 'success'}>
            {isPending ? '待开始' : isInProgress ? '会诊中' : '已完成'}
          </Tag>
        </div>
        <div className="flex gap-4">
          {isPending && (
            <Button 
              type="primary" 
              size="large"
              icon={<PlayCircleOutlined />} 
              onClick={() => handleStatusChange('IN_PROGRESS')} 
              className="bg-blue-600 px-8 h-12 text-base shadow-md hover:shadow-lg transition-all"
            >
              开始会诊
            </Button>
          )}
          {isInProgress && (
            <Button 
              type="primary" 
              danger 
              size="large"
              icon={<CheckCircleOutlined />} 
              onClick={() => handleStatusChange('COMPLETED')}
              className="px-8 h-12 text-base shadow-md hover:shadow-lg transition-all"
            >
              结束会诊
            </Button>
          )}
          {isCompleted && (
             <Button 
                onClick={() => navigate('/tasks')}
                size="large"
                className="px-8 h-12 text-base"
             >
                返回列表
             </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
