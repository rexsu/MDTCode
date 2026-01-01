import { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Task } from '../../types';
import request from '../../lib/request';
import CreateTaskModal from '../../components/CreateTaskModal';

import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function TaskList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await request.get<any, Task[]>('/tasks');
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns = [
    {
      title: '预定会诊时间',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (text: string) => (
        <div className="font-medium text-gray-700">
          <div>{dayjs(text).format('YYYY-MM-DD')}</div>
          <div className="text-sm text-gray-500">{dayjs(text).format('HH:mm')}</div>
        </div>
      ),
      sorter: (a: Task, b: Task) => dayjs(a.scheduledTime).unix() - dayjs(b.scheduledTime).unix(),
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_: any, record: Task) => (
        <div className="py-1">
          <div className="mb-1">
            <span className="font-bold text-gray-800 text-base mr-2">{record.patientName}</span>
            <span className="text-gray-600 text-sm mr-2">{record.patientGender}</span>
            <span className="text-gray-600 text-sm">{record.patientAge}岁</span>
          </div>
          <div className="text-gray-500 text-xs mt-1 truncate max-w-xs" title={record.chiefComplaint}>
            <span className="text-gray-400">主诉:</span> {record.chiefComplaint}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: 'blue',
          IN_PROGRESS: 'orange',
          COMPLETED: 'green',
          ARCHIVED: 'default',
        };
        const textMap: Record<string, string> = {
          PENDING: '待会诊',
          IN_PROGRESS: '会诊中',
          COMPLETED: '已完成',
          ARCHIVED: '已归档',
        };
        return (
          <Tag 
            color={colorMap[status]} 
            className="!px-3 !py-1 !text-sm !font-medium !rounded-full"
          >
            {textMap[status] || status}
          </Tag>
        );
      },
    },
    {
      title: '专家邀请情况',
      key: 'experts',
      render: (_: any, record: Task) => {
        if (!record.experts || record.experts.length === 0) {
          return <span className="text-gray-400 text-sm">暂无专家</span>;
        }
        return (
          <Space wrap>
            {record.experts.map((item) => (
              <Tag 
                key={item.id} 
                color={item.status === 'ACCEPTED' ? 'green' : 'default'}
                className="!px-3 !py-1 !text-sm !rounded-full"
              >
                {item.expert.realName}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="middle">
          <a 
            onClick={() => navigate(`/tasks/${record.id}`)}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
          >
            详情
          </a>
          <a className="text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer">
            取消
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2 !text-gray-800">
              会诊任务管理
            </Title>
            <p className="text-gray-500 text-sm">管理和跟踪所有MDT会诊任务</p>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)}
            className="!bg-blue-600 hover:!bg-blue-700 !shadow-lg hover:!shadow-xl transition-all !h-12 !px-8 !text-base !rounded-lg"
          >
            新增会诊任务
          </Button>
        </div>
        
        <Card 
          className="!shadow-xl !rounded-2xl !border-0 overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条任务`,
              className: 'px-6 py-4'
            }}
          />
        </Card>
      </div>

      <CreateTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTasks();
        }}
      />
    </div>
  );
}
