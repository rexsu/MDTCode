import axios from 'axios';
import { message } from 'antd';
import { Task, PreDoc, Dialog, PostDoc, Report, TaskLog, ExpertOpinion } from '@/types';

const request = axios.create({
  baseURL: '/api', // 通过 Vite 代理转发到后端
  timeout: 10000,
});

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || '请求失败，请稍后重试';
    message.error(Array.isArray(msg) ? msg[0] : msg);
    return Promise.reject(error);
  }
);

export default request;
export interface TaskDetail extends Task {

  presentIllness: string;
  treatmentPlan: string;
  goal: string;
  pastHistory?: string;
  familyHistory?: string;
  preDoc: PreDoc;
  dialogs: Dialog[];
  postDoc: PostDoc;
  report: Report;
  logs: TaskLog[];
  opinions: ExpertOpinion[];
}
