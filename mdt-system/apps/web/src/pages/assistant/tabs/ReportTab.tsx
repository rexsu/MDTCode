import { useState, useEffect } from 'react';
import { Button, Typography, Descriptions, Space, message } from 'antd';
import { PrinterOutlined, FileSyncOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import request from '../../../lib/request';
import { TaskDetail } from "@/lib/request";
import { useSocket } from '../../../lib/SocketContext';

const { Title, Paragraph, Text } = Typography;

interface Props {
  task: TaskDetail;
  onRefresh: () => void;
}

export default function ReportTab({ task, onRefresh }: Props) {
  const { id: taskId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const report = task.report;

  // 监听报告更新
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        message.info('报告内容已更新');
        onRefresh();
      };
      socket.on('REPORT_UPDATED', handleUpdate);
      return () => {
        socket.off('REPORT_UPDATED', handleUpdate);
      };
    }
  }, [socket, onRefresh]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await request.post(`/tasks/${taskId}/report`);
      message.success('报告生成/更新成功');
      onRefresh();
    } catch (error) {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg">
        <FilePdfOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
        <Title level={4}>尚未生成会诊报告</Title>
        <Paragraph className="text-gray-500 mb-6">
          请确保会诊文书已提交，且已采纳必要的专家意见。
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          onClick={handleGenerate} 
          loading={loading}
          icon={<FileSyncOutlined />}
        >
          生成会诊报告
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-600 p-8 overflow-y-auto">
      {/* 打印操作栏 (打印时不显示) */}
      <div className="mb-4 flex justify-end gap-2 print:hidden sticky top-0 z-10">
        <Button icon={<FileSyncOutlined />} onClick={handleGenerate} loading={loading}>
          刷新报告
        </Button>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          打印 / 导出 PDF
        </Button>
      </div>

      {/* 报告主体 (A4 纸张效果) */}
      <div className="bg-white shadow-2xl mx-auto p-[40px] min-h-[1000px] w-[794px] print:w-full print:shadow-none print:p-0 print:m-0">
        <div className="text-center mb-12 border-b-2 border-black pb-4">
          <Title level={2} style={{ marginBottom: 8 }}>MDT 多学科联合会诊报告单</Title>
          <Text className="text-sm">报告编号: {report.id.substring(0, 8)}</Text>
        </div>

        <Descriptions bordered column={2} className="mb-8" size="small">
          <Descriptions.Item label="患者姓名" labelStyle={{ width: '100px', fontWeight: 'bold' }}>{task.patientName}</Descriptions.Item>
          <Descriptions.Item label="性别/年龄" labelStyle={{ width: '100px', fontWeight: 'bold' }}>{task.patientGender} / {task.patientAge}岁</Descriptions.Item>
          <Descriptions.Item label="会诊时间" labelStyle={{ fontWeight: 'bold' }}>{new Date(task.scheduledTime).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="主诉" labelStyle={{ fontWeight: 'bold' }}>{task.chiefComplaint}</Descriptions.Item>
        </Descriptions>

        <div className="mb-8">
          <div className="font-bold text-lg border-l-4 border-blue-600 pl-2 mb-4">会诊总结与专家意见</div>
          <div className="whitespace-pre-wrap text-base leading-relaxed p-4 border border-gray-200 rounded min-h-[200px]">
            {report.finalSummary}
          </div>
        </div>

        <div className="mb-12">
          <div className="font-bold text-lg border-l-4 border-green-600 pl-2 mb-4">健康宣教与随访计划</div>
          <div className="whitespace-pre-wrap text-base leading-relaxed p-4 border border-gray-200 rounded min-h-[150px]">
            {report.finalEducation}
          </div>
        </div>

        <div className="flex justify-between mt-20 pt-8 border-t border-gray-300">
          <Space direction="vertical">
            <Text className="font-bold">会诊中心（盖章）：</Text>
            <div className="h-24 w-24 border-2 border-red-400 rounded-full flex items-center justify-center text-red-400 rotate-[-15deg] opacity-50">
              MDT专用章
            </div>
          </Space>
          <Space direction="vertical" align="end" size="large">
            <div className="mt-8">执行医师签字：________________</div>
            <Text>日期：{new Date().toLocaleDateString()}</Text>
          </Space>
        </div>
      </div>
    </div>
  );
}
