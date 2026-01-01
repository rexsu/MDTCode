import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout, Menu } from 'antd';
import { MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import TaskList from './pages/assistant/TaskList';
import TaskDetail from './pages/assistant/TaskDetail';
import { SocketProvider } from './lib/SocketContext';
import 'dayjs/locale/zh-cn';

const { Header, Content, Sider } = Layout;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <SocketProvider>
        <BrowserRouter>
          <Layout className="min-h-screen">
            <Header className="flex items-center justify-between px-8 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg fixed top-0 left-0 right-0 z-50" style={{ height: '64px' }}>
              <div className="text-2xl font-bold text-white flex items-center gap-3">
                <MedicineBoxOutlined className="text-3xl" />
                <span className="tracking-wide">MDT 多端会诊系统</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <UserOutlined className="text-white text-lg" />
                <span className="text-white font-medium">会诊助理</span>
              </div>
            </Header>
            <Layout style={{ marginTop: '64px' }}>
              <Sider width={220} className="bg-white shadow-md" style={{ height: 'calc(100vh - 64px)', position: 'fixed', left: 0, top: '64px', overflow: 'auto' }}>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['tasks']}
                  className="border-0 pt-4"
                  style={{ height: '    100%' }}
              items={[
                    {
                      key: 'tasks',
                      icon: <MedicineBoxOutlined className="text-lg" />,
                      label: <span className="font-medium">会诊任务管理</span>,
                    },
                  ]}
                />
              </Sider>
              <Layout className="bg-gray-50" style={{ marginLeft: '220px' }}>
                <Content className="min-h-[calc(100vh-64px)]">
                  <Routes>
                    <Route path="/" element={<Navigate to="/tasks" replace />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/tasks/:id" element={<TaskDetail />} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          </Layout>
        </BrowserRouter>
      </SocketProvider>
    </ConfigProvider>
  );
}

export default App;
