# Qianliclaw Agent Guide

## 项目概述

Qianliclaw 是一个用于 OpenClaw 人性化可视化配置的 Web 应用，采用 Monorepo 架构。

## 技术栈

### 包管理器

- pnpm workspace (版本 9.14.2)
- Node.js >= 22

### 前端 (apps/web)

- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- React Router DOM (路由)
- Zustand (状态管理)
- lucide-react (图标)

### 后端 (apps/server)

- Express + TypeScript
- tsx (开发时运行)
- cors (跨域)
- json5 (JSON5 解析)

## 项目结构

```
qianliclaw/
├── apps/
│   ├── web/                 # 前端应用
│   │   ├── src/
│   │   │   ├── api/         # API 客户端
│   │   │   │   └── client.ts # API 请求封装
│   │   │   ├── components/  # UI 组件
│   │   │   │   ├── Layout.tsx           # 布局组件
│   │   │   │   ├── ConfigFormBlock.tsx  # 配置表单块
│   │   │   │   ├── ConfigOctopus3D/     # 3D 配置可视化
│   │   │   │   └── WorkspaceHumanoid/   # 工作区人体模型
│   │   │   ├── constants/   # 常量定义
│   │   │   │   ├── configBodyMap.ts     # 配置映射
│   │   │   │   └── workspaceBodyMap.ts   # 工作区映射
│   │   │   ├── lib/         # 工具库
│   │   │   │   ├── utils.ts             # 通用工具
│   │   │   │   └── useTheme.ts          # 主题切换
│   │   │   ├── pages/       # 页面组件
│   │   │   │   ├── ConfigPage.tsx        # 配置页
│   │   │   │   ├── WorkspacePage.tsx     # 工作区页
│   │   │   │   ├── StatusPage.tsx        # 状态页
│   │   │   │   └── SettingsPage.tsx      # 设置页
│   │   │   ├── App.tsx      # 根组件
│   │   │   ├── main.tsx      # 入口文件
│   │   │   └── index.css    # 全局样式
│   │   ├── package.json
│   │   ├── vite.config.ts  # Vite 配置
│   │   └── tailwind.config.js # Tailwind 配置
│   │
│   ├── server/              # 后端服务
│   │   ├── src/
│   │   │   ├── routes/      # 路由
│   │   │   │   ├── config.ts     # 配置 API 路由
│   │   │   │   ├── workspace.ts  # 工作区 API 路由
│   │   │   │   ├── status.ts     # 状态 API 路由
│   │   │   │   └── settings.ts   # 设置 API 路由
│   │   │   ├── services/    # 业务服务
│   │   │   │   ├── configService.ts    # 配置服务
│   │   │   │   ├── workspaceService.ts # 工作区服务
│   │   │   │   ├── statusService.ts    # 状态服务
│   │   │   │   ├── settingsService.ts  # 设置服务
│   │   │   │   └── paths.ts            # 路径处理
│   │   │   └── index.ts    # 服务入口
│   │   └── package.json
│   │
│   └── openclaw/            # OpenClaw 配置文件
│
├── package.json             # 根 package.json (workspace 配置)
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
└── README.md                # 项目文档
```

## 开发命令

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 同时启动前后端
pnpm run dev

# 仅启动后端 (端口 3840)
pnpm run dev:server

# 仅启动前端 (端口 5173)
pnpm run dev:web
```

### 构建

```bash
# 构建所有应用
pnpm run build
```

### 代码检查

```bash
# 运行 lint
pnpm run lint
```

## API 路由

后端服务运行在 `http://127.0.0.1:3840`，提供以下 API：

- `GET /api/health` - 健康检查
- `/api/config/*` - 配置相关 API
- `/api/workspace/*` - 工作区相关 API
- `/api/status/*` - 状态相关 API
- `/api/settings/*` - 设置相关 API

前端通过 Vite 代理将 `/api` 请求转发到后端。

## 前端路由

- `/config` - 配置页面
- `/workspace` - 工作区页面
- `/status` - 状态页面
- `/settings` - 设置页面

## 代码规范

### TypeScript

- 使用 TypeScript 5.6.3
- 前端组件使用 React.FC 或函数组件
- 后端使用 ES 模块 (`"type": "module"`)

### 样式

- 使用 Tailwind CSS
- 支持深色模式 (dark mode)
- 使用 `cn()` 工具函数合并类名

### 状态管理

- 前端使用 Zustand
- 服务端直接通过服务层管理状态

## 注意事项

1. **端口**: 后端默认 3840，前端默认 5173
2. **跨域**: 后端已配置 CORS
3. **代理**: 前端通过 Vite 代理 `/api` 请求
4. **热重载**: 开发模式下支持热重载
5. **构建**: 前端产物在 `apps/web/dist/`，后端在 `apps/server/dist/`

## 常见任务

### 添加新页面

1. 在 `apps/web/src/pages/` 创建页面组件
2. 在 `apps/web/src/components/Layout.tsx` 添加导航项
3. 在 `apps/web/src/App.tsx` 添加路由

### 添加新 API 路由

1. 在 `apps/server/src/routes/` 创建路由文件
2. 在 `apps/server/src/services/` 创建对应服务
3. 在 `apps/server/src/index.ts` 注册路由

### 添加新组件

1. 在 `apps/web/src/components/` 创建组件
2. 使用 Tailwind CSS 样式
3. 支持深色模式

## 测试

目前项目未配置测试，如需添加测试请先与团队确认测试框架选择。
