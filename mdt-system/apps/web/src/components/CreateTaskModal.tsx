import { Modal, Form, Input, InputNumber, DatePicker, Select, Divider, Row, Col, Button } from 'antd';
import { CreateTaskParams } from '../types';
import request from '../lib/request';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: CreateTaskParams = {
        ...values,
        scheduledTime: values.scheduledTime.toISOString(),
      };
      
      await request.post('/tasks', payload);
      form.resetFields();
      onSuccess();
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新建会诊任务"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={form.submit}>
          提交任务
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ patientGender: '男' }}
      >
        <Divider orientation="left">患者基本信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="patientName" label="姓名" rules={[{ required: true }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="patientGender" label="性别" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="男">男</Select.Option>
                <Select.Option value="女">女</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="patientAge" label="年龄" rules={[{ required: true }]}>
              <InputNumber min={1} max={120} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="scheduledTime" label="预定会诊时间" rules={[{ required: true }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="chiefComplaint" label="主诉" rules={[{ required: true }]}>
          <Input.TextArea rows={2} placeholder="患者的主要症状及持续时间" />
        </Form.Item>

        <Divider orientation="left">会诊前文书 (必填项)</Divider>
        <Form.Item name="presentIllness" label="现病史" rules={[{ required: true }]}>
          <Input.TextArea rows={4} showCount maxLength={1000} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="treatmentPlan" label="目前治疗方案" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="goal" label="本次会诊目的" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">选填信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="pastHistory" label="既往史">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="familyHistory" label="家族史">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="personalHistory" label="个人史">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
