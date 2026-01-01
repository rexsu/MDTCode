# MDT System 技术说明文档

本文档旨在为开发人员、架构师及项目维护者提供 MDT (Multi-Disciplinary Team) 系统的深入技术细节，涵盖架构设计、核心模块说明、API 交互流程及开发指南。

## 1. 系统架构

项目采用 **Monorepo** 结构管理，基于 Turborepo 构建，包含以下核心组件：

### 1.1 技术栈

- **前端 (`apps/web`)**:
  - **框架**: React 18 + Vite
  - **UI 组件**: Ant Design 5 + Tailwind CSS
  - **状态管理**: Zustand (轻量级状态管理)
  - **实时通信**: Socket.io-client
  - **HTTP 请求**: Axios (统一拦截器处理)

- **后端 (`apps/api`)**:
  - **框架**: NestJS (模块化、依赖注入)
  - **实时网关**: @nestjs/websockets (Socket.io)
  - **ORM**: Prisma (类型安全的数据库访问)
  - **语音服务**: WebSocket Client (连接阿里云 FunASR)

- **数据库 (`packages/database`)**:
  - **数据库**: SQLite (开发环境) / PostgreSQL (生产环境建议)
  - **缓存**: Redis (用于 Socket.io 适配器及临时缓存，可选)

### 1.2 数据流向

```mermaid
graph LR
    User[用户 (PC/Web)] -- HTTP/REST --> Gateway[NestJS API 网关]
    User -- WebSocket (Socket.io) --> Gateway
    Gateway -- Prisma Client --> DB[(Database)]
    Gateway -- WebSocket --> FunASR[阿里云 FunASR 服务]
    FunASR -- 识别结果 --> Gateway -- 广播 --> User
```

## 2. 核心模块说明

### 2.1 实时语音识别 (FunASR 集成)

为了实现专家语音的实时转录，系统集成了阿里云 DashScope FunASR 服务。

- **前端 (`ExpertConsultationTab.tsx`)**:
  - 使用 Web Audio API (`AudioContext`, `ScriptProcessorNode`) 采集麦克风音频。
  - 将音频流降采样并转换为 PCM 格式 (16k sample rate, 16-bit)。
  - 通过 Socket.io 事件 `audioData` 实时推送二进制音频块给后端。
  - 监听 `asrResult` 事件以显示实时转录文本。

- **后端 (`FunAsrService.ts`)**:
  - 维护与阿里云的 WebSocket 连接池 (`Map<localTaskId, WebSocket>`)。
  - 封装 `startSession`, `sendAudioChunk`, `stopSession` 方法。
  - 处理阿里云返回的 `result-generated` 事件，并通过 `EventsGateway` 回传给前端。

### 2.2 任务状态机

会诊任务 (`ConsultationTask`) 包含严格的状态流转逻辑：

- **PENDING (待会诊)**: 仅允许编辑基本信息，无法进入问诊/报告 Tab。
- **IN_PROGRESS (会诊中)**: 解锁“专家问诊”、“专家意见” Tab；允许录音、发送消息。
- **COMPLETED (已完成)**: 锁定问诊记录；解锁“会诊报告” Tab，允许生成/打印报告。
- **ARCHIVED (已归档)**: 所有内容只读。

### 2.3 实时协同 (EventsGateway)

基于 Socket.io 的 `Room` 机制实现：
- 客户端进入任务详情页时加入 `taskId` 对应的 Room。
- 关键操作（如状态变更、新消息、ASR 结果）会向 Room 内广播，实现多端同步。

## 3. 关键 API 与交互

### 3.1 任务管理
- `POST /tasks`: 创建新任务
- `GET /tasks`: 列表查询
- `GET /tasks/:id`: 获取详情（包含关联表数据）
- `PATCH /tasks/:id/status`: 变更状态

### 3.2 WebSocket 事件

| 事件名 | 方向 | 参数 | 说明 |
| :--- | :--- | :--- | :--- |
| `joinRoom` | C -> S | `taskId` | 加入任务房间 |
| `startAsr` | C -> S | `taskId` | 开启语音识别会话 |
| `audioData` | C -> S | `Buffer` | 推送音频 PCM 数据 |
| `stopAsr` | C -> S | - | 停止语音识别 |
| `asrResult` | S -> C | `{ text, isFinal }` | 推送识别结果 |
| `TASK_UPDATED` | S -> C | `{ type, ... }` | 任务状态/内容更新通知 |

## 4. 开发指南

### 4.1 新增功能模块
1. **数据库变更**: 修改 `packages/database/prisma/schema.prisma` -> `npx prisma db push`。
2. **后端逻辑**: 在 `apps/api/src` 下创建新的 Module/Controller/Service。
3. **前端页面**: 在 `apps/web/src/pages` 下开发 UI，调用 API。

### 4.2 调试语音识别
- 确保 `apps/api/.env` 中配置了有效的 `DASHSCOPE_API_KEY`。
- 前端需在 `localhost` 或 HTTPS 环境下运行，否则无法获取麦克风权限。

### 4.3 部署注意事项
- 生产环境建议将 `.env` 中的 `DATABASE_URL` 指向 PostgreSQL 实例。
- 后端使用 `pm2` 或 `docker` 部署；前端构建为静态资源由 Nginx 托管。
- Nginx 需配置 WebSocket 反向代理支持 (Upgrade 头)。

## 5. 常见问题 (FAQ)

- **Q: 为什么语音识别没有反应？**
  - A: 检查 API Key 是否正确；检查浏览器麦克风权限；查看后端日志是否有 WebSocket 连接报错。
- **Q: 数据库 Schema 修改后未生效？**
  - A: 运行 `npx prisma generate` 重新生成 Client 类型，并重启服务。
