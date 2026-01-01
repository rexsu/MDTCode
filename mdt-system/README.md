# MDT 多端会诊系统

## 项目简介
MDT (Multi-Disciplinary Team) 多端会诊系统，包含 Web 前端与 NestJS 后端。

## 环境要求
- Node.js (v18+)
- Docker (用于启动数据库)

## 快速开始

### 1. 启动基础服务 (数据库)
确保 Docker 已运行，然后在项目根目录执行：
```bash
docker-compose up -d
```

### 2. 安装依赖
```bash
npm install
```

### 3. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务
```bash
# 同时启动前端和后端
npm run dev
```

- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3000

## 目录结构
- `apps/web`: React 前端项目
- `apps/api`: NestJS 后端服务
- `packages/database`: 数据库 Prisma 定义
