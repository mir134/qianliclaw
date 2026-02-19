import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';
import { ConfigOctopus3D } from '@/components/ConfigOctopus3D';

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
  const [activeConfigKey, setActiveConfigKey] =
    useState<ConfigKeyId>('gateway');
  const [config, setConfig] = useState<Config | null>(null);
  const [configPath, setConfigPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'ok' | 'err'
  >('idle');
  const [editingText, setEditingText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

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
      if (activeConfigKey === 'raw') {
        setEditingText(JSON.stringify(config, null, 2));
      } else {
        const section = config[activeConfigKey];
        setEditingText(
          JSON.stringify(section !== undefined ? section : {}, null, 2)
        );
      }
      setParseError(null);
    }
  }, [config, activeConfigKey]);

  const save = useCallback(async () => {
    if (!config) return;

    try {
      const parsed = JSON.parse(editingText);
      if (activeConfigKey === 'raw') {
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          setParseError('配置必须为 JSON 对象');
          return;
        }
        setConfig(parsed);
      } else {
        const next = { ...config, [activeConfigKey]: parsed };
        setConfig(next);
      }
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'JSON 解析失败');
      return;
    }

    setSaveStatus('saving');
    try {
      const configToSave =
        activeConfigKey === 'raw'
          ? JSON.parse(editingText)
          : { ...config, [activeConfigKey]: JSON.parse(editingText) };
      await api.config.put(configToSave);
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('err');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [config, editingText, activeConfigKey]);

  const handlePartClick = useCallback((configKey: string) => {
    if (CONFIG_KEYS.some((k) => k.id === configKey)) {
      setActiveConfigKey(configKey as ConfigKeyId);
    }
  }, []);

  if (loading) return <p className="text-neutral-600">加载配置中…</p>;
  if (error) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p>配置路径：{configPath || '—'}</p>
        <p>错误：{error}</p>
      </div>
    );
  }

  const currentLabel =
    CONFIG_KEYS.find((k) => k.id === activeConfigKey)?.label || '';
  const currentDocs = CONFIG_DOCS[activeConfigKey];

  return (
    <div className="space-y-4">
      {configPath && (
        <p className="text-xs text-neutral-500">配置文件：{configPath}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-2">
        {CONFIG_KEYS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveConfigKey(id)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm',
              activeConfigKey === id
                ? 'bg-neutral-200 font-medium'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-sm text-neutral-500">
          {saveStatus === 'saving' && '保存中…'}
          {saveStatus === 'ok' && '已保存'}
          {saveStatus === 'err' && '保存失败'}
        </span>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[400px] lg:min-w-[400px]">
          <ConfigOctopus3D
            onPartClick={handlePartClick}
            selectedConfigKey={activeConfigKey}
          />
        </div>
        <div className="min-w-0 flex-1 grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                {activeConfigKey === 'raw' ? '完整配置' : currentLabel} JSON
              </span>
              <button
                type="button"
                className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
                onClick={save}
              >
                保存
              </button>
            </div>
            {parseError && (
              <p className="mb-2 text-sm text-red-600">{parseError}</p>
            )}
            <textarea
              className="w-full h-[400px] resize-none rounded border border-neutral-300 p-2 font-mono text-sm"
              value={editingText}
              onChange={(e) => {
                setEditingText(e.target.value);
                setParseError(null);
              }}
              spellCheck={false}
            />
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 shadow-sm flex flex-col h-[476px]">
            <h3 className="mb-2 text-sm font-semibold text-neutral-700">
              {currentLabel} 配置说明
            </h3>
            <p className="mb-3 text-sm text-neutral-600 leading-relaxed">
              {currentDocs.description}
            </p>
            <div className="mb-2 text-xs font-medium text-neutral-500 uppercase">
              示例配置
            </div>
            <pre className="flex-1 overflow-auto rounded border border-neutral-300 bg-white p-2 text-xs font-mono text-neutral-700 leading-relaxed">
              {currentDocs.example}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
