# OpenClaw 人性化可视化配置 (qianliclaw)

对 [OpenClaw](https://docs.openclaw.ai)（个人 AI 助手）进行人性化可视化配置的 Web 应用：无需启动网关即可编辑 `openclaw.json` 与智能体工作区引导文件。

## 功能

- **配置**：表单化编辑网关、智能体、渠道、会话等，或直接编辑原始 JSON
- **工作区**：编辑 `USER.md`、`IDENTITY.md`、`SOUL.md`、`AGENTS.md`、`TOOLS.md`、`BOOTSTRAP.md`
- **状态**：查看配置路径、工作区路径，可选执行 `openclaw health`
- **设置**：配置根目录覆盖、OpenClaw CLI 路径、Gateway URL

## 环境要求

- Node.js >= 22
- pnpm（推荐）或 npm

## 安装

```bash
# 克隆或进入项目目录后
pnpm install
# 或
npm install
```

## 配置路径说明

- 默认读取 **`~/.openclaw/openclaw.json`**（Windows 为 `%USERPROFILE%\.openclaw\openclaw.json`）
- 若存在 **`~/.moltbot/moltbot.json`** 且不存在 openclaw 配置，则使用 moltbot 路径
- 可通过环境变量 **`OPENCLAW_CONFIG_HOME`** 指定配置根目录（例如 `OPENCLAW_CONFIG_HOME=/path/to/.openclaw`）
- 或在应用内「设置」页填写「配置根目录」覆盖路径（会写入 `~/.qianliclaw/settings.json`）

工作区路径来自配置中的 `agents.defaults.workspace`（如 `~/.openclaw/workspace`），会解析 `~` 为用户目录。

## 启动

**先启动后端，再启动前端：**

```bash
# 终端 1：后端（默认 http://127.0.0.1:3840）
pnpm run dev:server
# 或
cd apps/server && pnpm run dev

# 终端 2：前端（默认 http://127.0.0.1:5173，会代理 /api 到后端）
pnpm run dev:web
# 或
cd apps/web && pnpm run dev
```

在浏览器打开 http://127.0.0.1:5173 即可使用。前端通过 Vite 代理将 `/api` 请求转发到后端，无需单独配置 CORS。

## 构建

```bash
pnpm run build
```

- 后端产物：`apps/server/dist/`
- 前端产物：`apps/web/dist/`

生产环境可单独运行后端并托管前端静态资源，例如：

```bash
cd apps/server && node dist/index.js
# 将 apps/web/dist 用任意静态服务器托管，并设置 API 代理到 http://127.0.0.1:3840
```

## 后续：Electron 桌面版

架构已按「先 Web、后桌面」设计：

- 后端为独立 Node 服务，可被 Electron 主进程启动（监听 `localhost:3840`）
- 渲染进程加载打包后的前端（或开发时 `loadURL('http://127.0.0.1:5173')`）
- 可选：在 Electron 主进程内直接启动 `apps/server` 子进程，再加载 `file://` 或打包进 asar 的前端

具体打包步骤可在后续补充（如 `electron-builder` / `electron-vite` 配置）。

## 许可证

与 OpenClaw 项目一致，本仓库采用 MIT 许可证。
