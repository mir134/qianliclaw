import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { ConfigOctopus3D } from '@/components/ConfigOctopus3D';
import { JsonEditor, githubLightTheme, githubDarkTheme } from 'json-edit-react';
import { useTheme } from '@/lib/useTheme';

const themeMap = {
  dark: {
    ...githubDarkTheme,
    styles: {
      ...githubDarkTheme.styles,
      input: {
        color: '#e5e7eb',
        backgroundColor: '#374151',
        width: '100%',
      },
      inputHighlight: {
        color: '#e5e7eb',
        backgroundColor: '#4b5563',
        width: '100%',
      },
    },
  },
  light: {
    ...githubLightTheme,
    styles: {
      ...githubLightTheme.styles,
      input: {
        color: '#1f2937',
        backgroundColor: '#e5e7eb',
        width: '100%',
      },
      inputHighlight: {
        color: '#1f2937',
        backgroundColor: '#d1d5db',
        width: '100%',
      },
    },
  },
} as const;

const CONFIG_KEYS = [
  { id: 'gateway', label: '网关' },
  { id: 'models', label: '模型' },
  { id: 'agents', label: '智能体' },
  { id: 'channels', label: '渠道' },
  { id: 'tools', label: '工具' },
  { id: 'skills', label: '技能' },
  { id: 'plugins', label: '插件' },
  { id: 'auth', label: '认证' },
  { id: 'commands', label: '命令' },
  { id: 'raw', label: '原始 JSON' },
] as const;

type ConfigKeyId = (typeof CONFIG_KEYS)[number]['id'];

type Config = Record<string, unknown>;

const CONFIG_DOCS: Record<
  ConfigKeyId,
  { description: string; example: string }
> = {
  gateway: {
    description: '网关配置，控制 OpenClaw 服务的监听端口、绑定地址和认证方式。',
    example: `{
  "port": 18789,
  "mode": "local",
  "bind": "loopback",
  "auth": {
    "mode": "token",
    "token": "your-auth-token-here"
  },
  "tailscale": {
    "mode": "off",
    "resetOnExit": false
  }
}

字段说明：
- port: 监听端口号，默认 18789
- mode: 运行模式 "local" 或 "cloud"
- bind: 绑定地址 "loopback" 或 "all"
- auth.mode: 认证模式 "token" 或 "off"
- auth.token: 认证令牌
- tailscale.mode: Tailscale 集成模式`,
  },
  models: {
    description: '模型提供商配置，定义可用的 AI 模型及其连接方式。',
    example: `{
  "mode": "merge",
  "providers": {
    "oneapi": {
      "baseUrl": "https://api.example.com/v1",
      "apiKey": "your-api-key",
      "api": "openai-completions",
      "models": [
        {
          "id": "model-name",
          "name": "Model Display Name",
          "reasoning": false,
          "input": ["text"],
          "cost": {
            "input": 0.01,
            "output": 0.02,
            "cacheRead": 0,
            "cacheWrite": 0.01
          },
          "contextWindow": 128000,
          "maxTokens": 32000
        }
      ]
    }
  }
}

字段说明：
- mode: 配置合并模式 "merge" 或 "override"
- providers: 模型提供商配置对象
  - baseUrl: API 基础 URL
  - apiKey: API 密钥
  - api: API 类型
  - models: 模型列表配置`,
  },
  agents: {
    description:
      '智能体默认配置，包括工作区路径、主模型、并发数等。可配置多个隔离的智能体。',
    example: `{
  "defaults": {
    "model": {
      "primary": "oneapi/coding-plan",
      "fallbacks": ["oneapi/deepseek-v3"]
    },
    "workspace": "~/.openclaw/workspace",
    "maxConcurrent": 4,
    "subagents": {
      "maxConcurrent": 8
    }
  },
  "list": [
    {
      "id": "main",
      "default": true,
      "workspace": "~/.openclaw/workspace"
    }
  ]
}

字段说明：
- model.primary: 主模型标识
- model.fallbacks: 备用模型列表
- workspace: 工作区路径
- maxConcurrent: 最大并发智能体数
- subagents.maxConcurrent: 子智能体最大并发数
- list: 多智能体配置列表
  - id: 智能体 ID
  - default: 是否为默认智能体`,
  },
  channels: {
    description:
      '渠道配置，定义 Slack、飞书、WhatsApp、Telegram、Discord 等消息渠道的连接信息。',
    example: `{
  "slack": {
    "enabled": true,
    "mode": "socket",
    "webhookPath": "/slack/events",
    "botToken": "xoxb-...",
    "appToken": "xapp-1-...",
    "dmPolicy": "pairing",
    "groupPolicy": "allowlist",
    "channels": {
      "CHANNEL_ID": { "allow": true }
    }
  },
  "feishu": {
    "enabled": true,
    "appId": "cli_...",
    "appSecret": "...",
    "dmPolicy": "pairing",
    "groupPolicy": "open"
  }
}

字段说明：
- enabled: 是否启用该渠道
- botToken/appToken: 机器人 API 令牌
- dmPolicy: 私聊策略 "pairing" | "allowlist" | "open" | "disabled"
- groupPolicy: 群组策略 "allowlist" | "open" | "disabled"
- channels: 允许的频道配置`,
  },
  tools: {
    description: '工具配置，控制 Web 搜索、文件操作、提权执行等功能的使用。',
    example: `{
  "allow": [],
  "deny": [],
  "profile": "coding",
  "web": {
    "search": {
      "enabled": true,
      "apiKey": "your-search-api-key",
      "maxResults": 5
    },
    "fetch": {
      "enabled": true,
      "maxChars": 50000,
      "cacheTtlMinutes": 15
    }
  },
  "elevated": {
    "enabled": true,
    "allowFrom": {
      "whatsapp": ["+15555550123"]
    }
  }
}

字段说明：
- profile: 工具配置预设 "minimal" | "coding" | "messaging" | "full"
- allow/deny: 工具允许/拒绝列表
- web.search.enabled: 启用 Web 搜索
- web.fetch.enabled: 启用 Web 获取
- elevated.enabled: 启用提权工具（执行命令等）`,
  },
  skills: {
    description:
      '技能配置，管理内置技能和第三方技能的安装。技能是可被智能体调用的功能模块。',
    example: `{
  "install": {
    "nodeManager": "npm"
  },
  "entries": {
    "goplaces": {
      "apiKey": "your-google-places-api-key"
    },
    "openai-image-gen": {
      "apiKey": "your-openai-api-key"
    },
    "model-usage": {
      "enabled": false
    }
  }
}

字段说明：
- install.nodeManager: Node 包管理器 "npm" / "pnpm" / "yarn"
- entries: 各技能的配置项`,
  },
  plugins: {
    description:
      '插件配置，管理已安装的外部插件（如 Mattermost、MS Teams 等）。',
    example: `{
  "entries": {
    "slack": {
      "enabled": true
    },
    "feishu": {
      "enabled": true
    }
  },
  "installs": {
    "feishu": {
      "source": "npm",
      "spec": "@openclaw/feishu",
      "installPath": "/path/to/plugin",
      "version": "1.0.0"
    }
  }
}

字段说明：
- entries: 插件启用状态
- installs: 插件安装信息和元数据`,
  },
  auth: {
    description:
      '认证配置，定义支持的身份验证提供商（OpenAI、Anthropic 等）和认证配置文件。',
    example: `{
  "profiles": {
    "opencode:default": {
      "provider": "opencode",
      "mode": "api_key"
    },
    "anthropic:default": {
      "provider": "anthropic",
      "mode": "api_key"
    },
    "openai:default": {
      "provider": "openai",
      "mode": "api_key"
    }
  }
}

字段说明：
- profiles: 认证配置文件对象
  - provider: 提供商名称
  - mode: 认证模式（如 "api_key"）`,
  },
  commands: {
    description:
      '内置命令配置，控制哪些命令可以被调用，包括原生命令、文本命令、Bash 命令等。',
    example: `{
  "native": "auto",
  "text": true,
  "bash": false,
  "config": true,
  "restart": false,
  "debug": false,
  "allowFrom": {
    "*": ["user1"],
    "discord": ["user:123"]
  },
  "useAccessGroups": true
}

字段说明：
- native: 启用原生命令 "auto" | true | false
- text: 启用文本命令（/commands）
- bash: 启用 Bash 命令（! 命令）
- config: 启用配置命令（/config）
- restart: 启用重启命令
- allowFrom: 命令访问权限控制
- useAccessGroups: 使用访问组策略`,
  },
  raw: {
    description: '完整的 openclaw.json 配置文件，包含所有配置项。',
    example: `完整的配置文件内容，包含所有字段的组合。建议仅在需要批量编辑时使用此视图。`,
  },
};

export function ConfigPage() {
  const { theme } = useTheme();
  const [activeConfigKey, setActiveConfigKey] =
    useState<ConfigKeyId>('gateway');
  const [config, setConfig] = useState<Config | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'ok' | 'err'
  >('idle');
  const [parseError, setParseError] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<Record<string, unknown>>({});
  const [searchText, setSearchText] = useState('');

  const themeName = useMemo(() => {
    const dark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    return dark ? 'dark' : 'light';
  }, [theme]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.config.get();
      if (res.error) {
        setError(res.error);
        setConfig(res.config || {});
      } else {
        setConfig(res.config || {});
      }
      setConfigPath(res.configPath || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setConfig({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (config) {
      const section =
        activeConfigKey === 'raw' ? config : config[activeConfigKey];
      const data = section !== undefined ? section : {};
      setJsonData(data as Record<string, unknown>);
      setParseError(null);
    }
  }, [config, activeConfigKey]);

  const save = useCallback(async () => {
    if (!config) return;

    setSaveStatus('saving');
    try {
      const configToSave =
        activeConfigKey === 'raw'
          ? jsonData
          : { ...config, [activeConfigKey]: jsonData };
      await api.config.put(configToSave);
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [config, jsonData, activeConfigKey]);

  const handlePartClick = useCallback((configKey: string) => {
    if (CONFIG_KEYS.some((k) => k.id === configKey)) {
      setActiveConfigKey(configKey as ConfigKeyId);
    }
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400">加载配置中…</p>
        </div>
      </div>
    );
  if (error) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 p-6 text-sm text-amber-800 dark:text-amber-200 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold">配置错误</span>
        </div>
        <p className="mb-2">配置路径：{configPath || '—'}</p>
        <p>错误：{error}</p>
      </div>
    );
  }

  const currentLabel =
    CONFIG_KEYS.find((k) => k.id === activeConfigKey)?.label || '';
  const currentDocs = CONFIG_DOCS[activeConfigKey];

  return (
    <div className="space-y-6">
      {configPath && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            配置文件：
          </span>
          <span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
            {configPath}
          </span>
        </div>
      )}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-4">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {CONFIG_KEYS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveConfigKey(id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                  activeConfigKey === id
                    ? 'bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-800'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/80 dark:hover:bg-slate-700/50 hover:text-primary-700 dark:hover:text-primary-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                保存中…
              </div>
            )}
            {saveStatus === 'ok' && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                已保存
              </span>
            )}
            {saveStatus === 'err' && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <span className="text-lg">✗</span>
                保存失败
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[450px] lg:min-w-[450px]">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-white/10 h-[550px] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-200 flex-shrink-0">
              3D 章鱼模型
            </h2>
            <div className="flex-1 min-h-0">
              <ConfigOctopus3D
                onPartClick={handlePartClick}
                selectedConfigKey={activeConfigKey}
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 grid lg:grid-cols-2 gap-4">
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 dark:border-white/10">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {currentLabel.charAt(0)}
                </span>
                {activeConfigKey === 'raw' ? '完整配置' : currentLabel} JSON
              </span>
              <input
                type="text"
                placeholder="搜索字段或值..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all duration-200"
              />
              <button
                type="button"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-800 text-white font-medium hover:from-primary-800 hover:to-primary-900 shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-200 shrink-0"
                onClick={save}
              >
                保存
              </button>
            </div>
            {parseError && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {parseError}
              </div>
            )}
            <div className="h-[450px] overflow-auto rounded-xl bg-white/50 dark:bg-slate-900/50 border border-neutral-200 dark:border-slate-700 p-2">
              <JsonEditor
                data={jsonData}
                onUpdate={({ newData }) => {
                  setJsonData(newData as Record<string, unknown>);
                  setParseError(null);
                }}
                theme={themeMap[themeName] as any}
                searchText={searchText}
                searchFilter="all"
                className="w-full"
                maxWidth="100%"
              />
            </div>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 dark:border-white/10 flex flex-col h-[550px]">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {currentLabel.charAt(0)}
              </span>
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {currentLabel} 配置说明
              </h3>
            </div>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {currentDocs.description}
            </p>
            <div className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
              示例配置
            </div>
            <pre className="flex-1 overflow-auto rounded-xl border-2 border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs font-mono text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {currentDocs.example}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
